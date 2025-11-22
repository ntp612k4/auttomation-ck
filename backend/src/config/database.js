const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql_db",
  user: process.env.DB_USER || "n8n_user",
  password: process.env.DB_PASSWORD || "your_strong_user_password",
  database: process.env.DB_NAME || "n8n_db",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
