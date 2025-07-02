import { config } from 'dotenv';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

// Load environment variables from .env file
config();

export const env = createEnv({
  server: {
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
  },
  
  /**
   * What object holds the environment variables at runtime.
   * For Node.js, this is usually `process.env`.
   */
  runtimeEnv: process.env,
  
  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator. This means that if you have an empty string for a value
   * that is supposed to be a number (e.g. `PORT=` in a ".env" file), Zod will
   * incorrectly flag it as a type mismatch violation.
   * 
   * In order to solve this issue, we explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
  
  /**
   * Called when the schema validation fails.
   */
  onValidationError: (error: any) => {
    // Use basic console.error here as logger isn't available yet during env validation
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment variables');
  },
  
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  skipValidation: process.env['NODE_ENV'] === 'test',
}); 