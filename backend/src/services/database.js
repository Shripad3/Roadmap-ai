/**
 * Database Service
 * 
 * Manages PostgreSQL connection pool and provides query interface.
 * Uses connection pooling for better performance and resource management.
 */
import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;

console.log('=== DATABASE DEBUG ===');
console.log('process.env.DATABASE_URL:', process.env.DATABASE_URL);
console.log('Fallback:', 'postgresql://postgres:postgres@localhost:5432/taskapp');
const finalUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/taskapp';
console.log('Final URL being used:', finalUrl);
console.log('======================');
// Create connection pool
// A pool maintains multiple database connections that can be reused
// This is much more efficient than creating a new connection for each query
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/taskapp',
  // Maximum number of clients in the pool
  max: 20,
  // How long a client can be idle before being closed
  idleTimeoutMillis: 30000,
  // How long to wait for a connection before timing out
  connectionTimeoutMillis: 2000,
});

// Handle pool errors
// This prevents the app from crashing if a connection is lost
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client', err);
});

/**
 * Execute a SQL query
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters (prevents SQL injection)
 * @returns {Promise} Query result
 */
export const query = async (text, params) => {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (> 100ms) for performance monitoring
    if (duration > 100) {
      console.log('Slow query detected:', {
        text,
        duration: `${duration}ms`,
        rows: result.rowCount
      });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', {
      text,
      error: error.message
    });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * Use this when you need to execute multiple queries atomically
 * 
 * Example:
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   await client.query('INSERT INTO tasks...');
 *   await client.query('INSERT INTO subtasks...');
 *   await client.query('COMMIT');
 * } catch (e) {
 *   await client.query('ROLLBACK');
 * } finally {
 *   client.release();
 * }
 */
export const getClient = () => pool.connect();

/**
 * Close all database connections
 * Call this when shutting down the server gracefully
 */
export const closePool = async () => {
  await pool.end();
  console.log('Database pool closed');
};

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  } else {
    console.log('Database connected successfully at', res.rows[0].now);
  }
});

export default { query, getClient, closePool };
