import app from './app';
import { env } from './env';
import logger from './utils/logger';

// For Vercel serverless deployment
export default app;

// For local development
if (env.NODE_ENV !== 'production') {
  const PORT = env.PORT;
  
  app.listen(PORT, () => {
    logger.info(`☕ Calorie Counter API Server started on port ${PORT}`);
    logger.info(`📍 Health check: http://localhost:${PORT}/health`);
    logger.info(`🔒 Auth endpoints: http://localhost:${PORT}/auth/*`);
    logger.info(`🍎 Calorie endpoint: http://localhost:${PORT}/get-calories`);
    logger.info(`🔄 Auto-reload enabled - watching for file changes...`);
  });
} 