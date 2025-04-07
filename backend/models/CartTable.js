const pool = require('../config/db');

const createUserTable = async () => {
  const query = `
    CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

  `;
  await pool.query(query);
};

createUserTable();
