import { Router, Response, type IRouter } from 'express';
import { getCaloriesSchema } from '../types';
import { strictLimiterMiddleware } from '../middleware/rateLimiter';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import usdaService from '../services/usdaService';
import logger from '../utils/logger';

const router: IRouter = Router();

router.post('/get-calories', strictLimiterMiddleware, authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validationResult = getCaloriesSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: validationResult.error.flatten().fieldErrors,
        status_code: 400,
      });
    }
    
    const { dish_name, servings } = validationResult.data;

    if (servings <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Servings must be a positive number',
        status_code: 400,
      });
    }

    const calorieData = await usdaService.calculateCalories(dish_name, servings);
    
    logger.info(`Calorie calculation successful`, {
      userId: req.user?.id,
      dishName: dish_name,
      servings,
      totalCalories: calorieData.total_calories
    });
    
    return res.status(200).json(calorieData);
  } catch (error) {
    logger.error('Calorie calculation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('No foods found') || error.message.includes('No suitable match found')) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Dish not found: ${error.message}`,
          status_code: 404,
        });
      }
      
      if (error.message.includes('No calorie information available')) {
        return res.status(422).json({
          error: 'Unprocessable Entity',
          message: error.message,
          status_code: 422,
        });
      }
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to calculate calories',
              status_code: 500,
    });
  }
});

export default router; 