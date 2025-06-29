const { Pool } = require("pg");

const pool = new Pool({
  user: "aggregates_db1_user",
  host: "dpg-d1ftfm7gi27c73e8il3g-a",
  database: "aggregates_db1",
  password: "KMX9okY6uQ4L9Pt3e8ajWH8pOhPjgoYK",
  port: 5432,
});

module.exports = pool;
