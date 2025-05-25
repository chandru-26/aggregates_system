require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting (prevent brute force / abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// PostgreSQL Connection
const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'root',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'ordering_db',
      }
);

// Health Check Route
app.get('/api/test', (req, res) => res.send('✅ API is working'));

// --- AUTH ---

app.post('/api/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    await pool.query(
      'INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4)',
      [name, email, password, phone]
    );
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/loginOwner', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, name, email FROM owners WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Owner Login Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- PRODUCTS ---

app.post('/api/products', async (req, res) => {
  const { name, image_url, quantity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (name, image_url, quantity) VALUES ($1, $2, $3) RETURNING *',
      [name, image_url, quantity]
    );
    res.status(201).json({ message: 'Product added!', product: result.rows[0] });
  } catch (err) {
    console.error('Add Product Error:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json({ products: result.rows });
  } catch (err) {
    console.error('Fetch Products Error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// --- CART ---

app.post('/api/cart', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [user_id, product_id, quantity]
    );
    res.status(201).json({ message: 'Item added to cart', cart: result.rows[0] });
  } catch (err) {
    console.error('Add to Cart Error:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

app.get('/api/cart/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.id, c.quantity, p.name, p.image_url, c.product_id 
       FROM cart c JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = $1`,
      [user_id]
    );
    res.json({ cart: result.rows });
  } catch (err) {
    console.error('Fetch Cart Error:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.delete('/api/cart/:user_id/:product_id', async (req, res) => {
  const { user_id, product_id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [user_id, product_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Remove Cart Item Error:', err);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

app.delete('/api/cart/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    await pool.query('DELETE FROM cart WHERE user_id = $1', [user_id]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Clear Cart Error:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// --- ORDERS ---

app.post('/api/orders', async (req, res) => {
  const { user_id } = req.body;

  try {
    const cartResult = await pool.query(
      'SELECT product_id, quantity FROM cart WHERE user_id = $1',
      [user_id]
    );

    const cartItems = cartResult.rows;
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    for (const item of cartItems) {
      await pool.query(
        `INSERT INTO orders (user_id, product_id, quantity, ordered_at)
         VALUES ($1, $2, $3, NOW())`,
        [user_id, item.product_id, item.quantity]
      );
    }

    await pool.query('DELETE FROM cart WHERE user_id = $1', [user_id]);
    res.status(200).json({ message: 'Order placed successfully!' });
  } catch (err) {
    console.error('Checkout Error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, p.name AS product_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      ORDER BY o.ordered_at DESC
    `);
    res.json({ orders: result.rows });
  } catch (err) {
    console.error('Fetch Orders Error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, fulfilled_at } = req.body;
  try {
    await pool.query(
      'UPDATE orders SET status = $1, fulfilled_at = $2 WHERE id = $3',
      [status, fulfilled_at, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Update Order Status Error:', err);
    res.status(500).json({ error: 'Database update failed' });
  }
});

// --- DELETE PRODUCT ---
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully!' });
  } catch (err) {
    console.error('Delete Product Error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
