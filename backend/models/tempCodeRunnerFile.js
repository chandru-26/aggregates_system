const pool = require('../config/db');

const createOrderTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      item VARCHAR(50) NOT NULL,
      quantity INT NOT NULL,
      status VARCHAR(20) DEFAULT 'Pending'
    );
  `;
  await pool.query(query);
};

createOrderTable();
