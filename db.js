/* ═══════════════════════════════════════════════════════════════
   db.js — MySQL Connection Pool
   Uses mysql2 with promise-based API for async/await support
   ═══════════════════════════════════════════════════════════════ */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'verdeledger_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✓ MySQL connected — database:', process.env.DB_NAME || 'verdeledger_db');
    conn.release();
  })
  .catch(err => {
    console.error('✗ MySQL connection failed:', err.message);
    console.error('  Make sure MySQL is running and the database exists.');
    console.error('  Run setup-database.sql to create the database and tables.');
  });

module.exports = pool;
