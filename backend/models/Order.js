const pool = require('../config/db');

const createOrderTable = async () => {
  const query = `
   CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  product VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

  `;
  await pool.query(query);
};

createOrderTable();
