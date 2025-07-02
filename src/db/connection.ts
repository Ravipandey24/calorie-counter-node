import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '../env';

// Create postgres client optimized for serverless (Vercel) environment
const client = postgres(env.DATABASE_URL, {
  // Serverless optimizations
  max: env.NODE_ENV === 'production' ? 1 : 20, // Limit connections in serverless
  idle_timeout: 30, // Close idle connections after 30s
  connect_timeout: 10, // Connection timeout in seconds
  // Connection retry settings
  max_lifetime: 60 * 30, // 30 minutes max connection lifetime
  // SSL configuration
  ssl: env.NODE_ENV === 'production' ? 'require' : false,
  // Debug mode for development
  debug: env.NODE_ENV === 'development',
  // Application name for monitoring
  connection: {
    application_name: 'calorie-counter-backend',
  },
  // Handle connection errors
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