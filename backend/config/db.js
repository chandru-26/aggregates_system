const { Pool } = require("pg");

const pool = new Pool({
  user: "aggregates_db_user",
  host: "dpg-d0ncch0dl3ps73a3k57g-a",
  database: "aggregates_db",
  password: "PaswuTS3eFDFASHWhkPAk6l5T7DfcrWS",
  port: 5432,
});

module.exports = pool;
