import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { env } from '../env';
import logger from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Access token is required',
        status_code: 401 
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number };
    
    // Fetch user from database
    const [user] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid token - user not found',
        status_code: 401 
      });
    }

    req.user = {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
    };
    return next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Invalid or expired token',
      status_code: 403 
    });
  }
}; 