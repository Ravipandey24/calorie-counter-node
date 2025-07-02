import { Router, Request, Response, type IRouter } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { registerSchema, loginSchema } from '../types';
import { authLimiterMiddleware } from '../middleware/rateLimiter';
import { env } from '../env';
import logger from '../utils/logger';

const router: IRouter = Router();

router.post('/register', authLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: validationResult.error.flatten().fieldErrors,
        status_code: 400,
      });
    }
    
    const { first_name, last_name, email, password } = validationResult.data;

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists',
        status_code: 409,
      });
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const [newUser] = await db
      .insert(users)
      .values({
        firstName: first_name,
        lastName: last_name,
        email,
        passwordHash,
      })
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      });

    const token = jwt.sign(
      { 
        userId: newUser!.id,
        first_name: newUser!.firstName,
        last_name: newUser!.lastName,
        email: newUser!.email,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );

    logger.info(`User registered successfully: ${newUser!.email}`, {
      userId: newUser!.id,
      email: newUser!.email
    });

    return res.status(201).json({
      user: {
        first_name: newUser!.firstName,
        last_name: newUser!.lastName,
        email: newUser!.email,
      },
      token,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register user',
      status_code: 500,
    });
  }
});

router.post('/login', authLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: validationResult.error.flatten().fieldErrors,
        status_code: 400,
      });
    }
    
    const { email, password } = validationResult.data;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(422).json({
        error: 'Invalid Credentials',
        message: 'Invalid email or password',
        status_code: 422,
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(422).json({
        error: 'Invalid Credentials',
        message: 'Invalid email or password',
        status_code: 422,
      });
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );

    logger.info(`User logged in successfully: ${user.email}`, {
      userId: user.id,
      email: user.email
    });

    return res.status(200).json({
      user: {
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
      },
      token,
    });
    } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to login user',
      status_code: 500,
    });
  }
});

export default router; 