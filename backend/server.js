const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ordering_db',
  password: 'root',
  port: 5432,
});

// Test route
app.get('/api/test', (req, res) => {
  res.send('✅ API is working');
});

// Register user
app.post('/api/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, password, phone]
    );
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add product
app.post('/api/products', async (req, res) => {
  const { name, image_url, quantity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (name, image_url, quantity) VALUES ($1, $2, $3) RETURNING *',
      [name, image_url, quantity]
    );
    res.status(201).json({ message: 'Product added!', product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.status(200).json({ products: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// Add to cart
app.post('/api/cart', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [user_id, product_id, quantity]
    );
    res.status(201).json({ message: 'Item added to cart', cart: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Get cart
app.get('/api/cart/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.id, c.quantity, p.name, p.image_url, c.product_id 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = $1`,
      [user_id]
    );
    res.json({ cart: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Remove from cart
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
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// Clear full cart
app.delete('/api/cart/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    await pool.query('DELETE FROM cart WHERE user_id = $1', [user_id]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// ✅ Checkout: Place order from cart
app.post('/api/orders', async (req, res) => {
  const { user_id } = req.body;

  console.log(`📦 Incoming order request for user_id: ${user_id}`);

  try {
    // ⬇️ Use 'cart' table instead of 'checkout'
    const cartResult = await pool.query(
      `SELECT product_id, quantity FROM cart WHERE user_id = $1`,
      [user_id]
    );

    const cartItems = cartResult.rows;
    console.log("🧾 Checkout items:", cartItems);

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

    // Clear the cart after placing the order
    await pool.query('DELETE FROM cart WHERE user_id = $1', [user_id]);

    res.status(200).json({ message: 'Order placed successfully!' });
  } catch (err) {
    console.error('❗ Checkout to Order error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});


app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('❗ Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// 📦 Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, p.name AS product_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      ORDER BY o.ordered_at DESC
    `);
    res.status(200).json({ orders: result.rows });
  } catch (err) {
    console.error('❗ Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PUT /api/orders/:id/status
app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, fulfilled_at } = req.body;

  try {
    await pool.query(
      'UPDATE orders SET status = $1, fulfilled_at = $2 WHERE id = $3',
      [status, fulfilled_at, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('❗ DB update error:', error);
    res.status(500).json({ error: 'Database update failed' });
  }
});




app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
