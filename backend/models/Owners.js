const pool = require('../config/db');

const createUserTable = async () => {
  const query = `
    CREATE TABLE Owners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15)
);

  `;
  await pool.query(query);
};

createUserTable();
