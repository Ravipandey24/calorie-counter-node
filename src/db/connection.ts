import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '../env';

// Create postgres client optimized for serverless (Vercel) environment
const client = postgres(env.DATABASE_URL, {
  // SSL configuration
  ssl: false,
  debug: env.NODE_ENV === 'development',
  connection: {
    application_name: 'calorie-counter-backend',
  },
  onnotice: (notice: any) => {
    if (env.NODE_ENV === 'development') {
      console.log('Database notice:', notice);
    }
  },
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Helper function to test database connection
export const testConnection = async () => {
  try {
    await client`SELECT 1`;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    if (error instanceof Error && 'code' in error) {
      if (error.code === 'ENOTFOUND') {
        console.error('  1. DATABASE_URL environment variable is correct');
        console.error('  2. Database instance is active (not paused)');
        console.error('  3. Network connectivity to database host');
      }
    }
    return false;
  }
};

export default db; 