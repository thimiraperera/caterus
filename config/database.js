/* ============================================================
   MySQL Connection Pool
   ============================================================ */
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'caterus',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Return dates as strings, not JS Date objects
  dateStrings: true,
});

// Test connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('  ✓ MySQL connected to', process.env.DB_NAME || 'caterus');
    conn.release();
  } catch (err) {
    console.error('  ✗ MySQL connection failed:', err.message);
    console.error('    Make sure MySQL is running and the database exists.');
    console.error('    Run: mysql -u root < database/schema.sql');
  }
})();

module.exports = pool;
