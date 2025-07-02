import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
config();

// Define the environment schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // External APIs
  USDA_API_KEY: z.string().min(1, 'USDA_API_KEY is required'),
  
  // Redis Configuration (Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL must be a valid URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required'),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // Server Configuration
  PORT: z.coerce.number().positive().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // CORS Configuration
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
});

// Custom environment validator function
function validateEnv() {
  // Skip validation in test environment
  if (process.env['NODE_ENV'] === 'test') {
    return process.env as any;
  }

  // Transform empty strings to undefined for proper default handling
  const processedEnv = Object.entries(process.env).reduce((acc, [key, value]) => {
    acc[key] = value === '' ? undefined : value;
    return acc;
  }, {} as Record<string, string | undefined>);

  try {
    return envSchema.parse(processedEnv);
  } catch (error) {
    console.error('❌ Invalid environment variables:');
    
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error(error);
    }
    
    throw new Error('Invalid environment variables');
  }
}

// Export the validated environment variables
export const env = validateEnv(); 