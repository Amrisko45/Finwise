import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'CvProject@42',
  database: 'finance_trackerDB',
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your needs
  queueLimit: 0,       // No limit on queued connections
});

// Export the pool
export default pool;
