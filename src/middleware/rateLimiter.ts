import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { Request, Response, NextFunction } from 'express';
import { env } from '../env.js';
import logger from '../utils/logger.js';

// Initialize Upstash Redis client
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Upstash native rate limiters (recommended for serverless)
export const upstashGeneralLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '15 m'), // 100 requests per 15 minutes
  analytics: true,
  prefix: 'rl:general',
});

export const upstashStrictLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(15, '15 m'), // 15 requests per 15 minutes
  analytics: true,
  prefix: 'rl:strict',
});

export const upstashAuthLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
  analytics: true,
  prefix: 'rl:auth',
});

// Express middleware wrappers for Upstash rate limiters
export const createUpstashMiddleware = (limiter: Ratelimit) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const { success, limit, remaining, reset } = await limiter.limit(ip);

      // Set rate limit headers
      res.set({
        'RateLimit-Limit': limit.toString(),
        'RateLimit-Remaining': remaining.toString(),
        'RateLimit-Reset': new Date(reset).toISOString(),
      });

      if (!success) {
        logger.warn(`Rate limit exceeded for IP: ${ip}`, {
          ip,
          limit,
          remaining,
          reset: new Date(reset).toISOString()
        });
        
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Too many requests from this IP, please try again later.',
          status_code: 429,
          retryAfter: Math.round((reset - Date.now()) / 1000),
        });
      }

      return next();
    } catch (error) {
      logger.error('Rate limiter error:', error);
      // Fail open - allow request if rate limiter fails
      return next();
    }
  };
};

// Upstash middleware instances
export const generalLimiterMiddleware = createUpstashMiddleware(upstashGeneralLimiter);
export const strictLimiterMiddleware = createUpstashMiddleware(upstashStrictLimiter);
export const authLimiterMiddleware = createUpstashMiddleware(upstashAuthLimiter);


// Export Redis client for other uses
export { redis }; 