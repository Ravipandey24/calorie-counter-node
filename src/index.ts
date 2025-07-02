import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { generalLimiterMiddleware } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import calorieRoutes from './routes/calories';
import { env } from './env';
import logger from './utils/logger';

const app = express();
const PORT = env.PORT;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.http(`${req.method} ${req.path}`, {
    method: req.method,
    url: req.url,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentLength: req.get('Content-Length'),
  });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'http';
    
    logger.log(level, `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.url,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      responseSize: res.get('Content-Length'),
    });
  });
  
  next();
});

app.use(generalLimiterMiddleware); // Apply general rate limiting with Redis

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Calorie Counter API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/', calorieRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    status_code: 404,
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong',
    status_code: 500,
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📍 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔒 Auth endpoints: http://localhost:${PORT}/auth/*`);
  logger.info(`🍎 Calorie endpoint: http://localhost:${PORT}/get-calories`);
}); 