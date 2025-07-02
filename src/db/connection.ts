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
  connectionTimeoutMillis: 2000, // Connection timeout for faster failures
  allowExitOnIdle: true, // Allow process to exit when no connections
});

export const db = drizzle(pool, { schema });

export default db; 