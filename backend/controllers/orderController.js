const pool = require('../config/db');
// controllers/orderController.js

const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ordering_db',
  password: 'root',
  port: 5432,
});

exports.removeCartItem = async (req, res) => {
  const { user_id, product_id } = req.body;
  try {
    const result = await pool.query(
      'DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [user_id, product_id]
    );

    if (result.rowCount > 0) {
      res.json({ message: '✅ Item removed from cart!' });
    } else {
      res.status(404).json({ error: '❗ Item not found in cart.' });
    }
  } catch (error) {
    console.error('❗ Error removing from cart:', error);
    res.status(500).json({ error: '❗ Failed to remove item from cart.' });
  }
};

// Place order
const placeOrder = async (req, res) => {
  const { userId, item, quantity } = req.body;

  try {
    const query = 'INSERT INTO orders (user_id, item, quantity) VALUES ($1, $2, $3) RETURNING *';
    const newOrder = await pool.query(query, [userId, item, quantity]);
    res.json({ message: 'Order placed successfully', order: newOrder.rows[0] });
  } catch (error) {
    res.status(500).send('Error placing order');
  }
};

// Get orders for owner
const getOrders = async (req, res) => {
  try {
    const query = 'SELECT * FROM orders';
    const orders = await pool.query(query);
    res.json(orders.rows);
  } catch (error) {
    res.status(500).send('Error fetching orders');
  }
};

module.exports = { placeOrder, getOrders };
