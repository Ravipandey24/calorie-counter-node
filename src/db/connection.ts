import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { env } from '../env';

// Optimized connection pool for serverless (Vercel) environment
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Serverless optimizations
  max: env.NODE_ENV === 'production' ? 1 : 20, // Limit connections in serverless
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Increased timeout for better reliability
  allowExitOnIdle: true, // Allow process to exit when no connections
  // Connection retry settings
  application_name: 'calorie-counter-backend',
  statement_timeout: 30000, // 30 second statement timeout
});

// Add error handling for connection issues
pool.on('error', (err: any) => {
  console.error('Database pool error:', err);
  if (err.code === 'ENOTFOUND') {
    console.error('❌ Database DNS resolution failed. Check:');
    console.error('  1. DATABASE_URL environment variable is correct');
    console.error('  2. Database instance is active (not paused)');
    console.error('  3. Network connectivity to database host');
  }
});

pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

export const db = drizzle(pool, { schema });

export default db; 