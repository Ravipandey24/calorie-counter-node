import axios, { AxiosResponse } from 'axios';
import { USDASearchResponse, USDAFood, CalorieResponse, ENERGY_NUTRIENT_IDS, MACRONUTRIENT_IDS } from '../types';
import { env } from '../env';
import logger from '../utils/logger';

class USDAService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.nal.usda.gov/fdc/v1';

  constructor() {
    this.apiKey = env.USDA_API_KEY;
  }

  /**
   * Search for foods using the USDA API
   */
  async searchFoods(query: string, pageSize: number = 25): Promise<USDAFood[]> {
    try {
      // Use POST request with JSON body as recommended by USDA API documentation
      const requestBody = {
        query: query.trim(),
        dataType: ['Foundation', 'SR Legacy', 'Survey (FNDDS)', 'Branded'],
        pageSize: Math.min(pageSize, 200), // API limit
        sortBy: 'dataType.keyword',
        sortOrder: 'asc'
      };

      const response: AxiosResponse<USDASearchResponse> = await axios.post(
        `${this.baseUrl}/foods/search`,
        requestBody,
        {
          params: {
            api_key: this.apiKey,
          },
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (!response.data || !Array.isArray(response.data.foods)) {
        throw new Error('Invalid response from USDA API');
      }

      return response.data.foods;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Log the error response and data
        logger.error('Error response from USDA API:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        if (error.response?.status === 400) {
          throw new Error('Invalid search query for USDA API');
        } else if (error.response?.status === 403) {
          throw new Error('Invalid USDA API key');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('USDA API request timeout');
        }
      }
      logger.error('Error searching foods:', error);
      throw new Error('Failed to search foods from USDA API');
    }
  }

  /**
   * Find the best matching food item using enhanced fuzzy matching
   */
  private findBestMatch(foods: USDAFood[], query: string): USDAFood | null {
    if (foods.length === 0) return null;

    const normalizedQuery = query.toLowerCase().trim();
    
    // Helper function to safely get description
    const getDescription = (food: USDAFood): string => {
      return food.description || '';
    };
    
    // Helper function to safely get lowercase description
    const getLowercaseDescription = (food: USDAFood): string => {
      return food.lowercaseDescription || '';
    };
    
    // Priority 1: Exact match (case-insensitive)
    const exactMatch = foods.find(food => {
      const desc = getDescription(food);
      const lowerDesc = getLowercaseDescription(food);
      return desc.toLowerCase() === normalizedQuery || lowerDesc === normalizedQuery;
    });
    if (exactMatch) return exactMatch;

    // Priority 2: Description starts with query
    const startsWithMatch = foods.find(food => {
      const desc = getDescription(food);
      const lowerDesc = getLowercaseDescription(food);
      return desc.toLowerCase().startsWith(normalizedQuery) || lowerDesc.startsWith(normalizedQuery);
    });
    if (startsWithMatch) return startsWithMatch;

    // Priority 3: Description contains full query
    const containsMatch = foods.find(food => {
      const desc = getDescription(food);
      const lowerDesc = getLowercaseDescription(food);
      return desc.toLowerCase().includes(normalizedQuery) || lowerDesc.includes(normalizedQuery);
    });
    if (containsMatch) return containsMatch;

    // Priority 4: Comprehensive scoring based on multiple factors
    const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);
    
    const scoredFoods = foods.map(food => {
      const foodDesc = getDescription(food).toLowerCase();
      const foodWords = foodDesc.split(/\s+/);
      
      let score = 0;
      
      // Word matching score
      const matchingWords = queryWords.filter(queryWord => 
        foodWords.some(foodWord => 
          foodWord.includes(queryWord) || queryWord.includes(foodWord)
        )
      );
      score += (matchingWords.length / queryWords.length) * 100;
      
      // Boost score for data type priority
      if (food.dataType === 'Foundation') score += 20;
      else if (food.dataType === 'SR Legacy') score += 15;
      else if (food.dataType === 'Survey (FNDDS)') score += 10;
      
      // Boost score if food has calorie information
      const hasCalories = food.foodNutrients && food.foodNutrients.some(nutrient => 
        nutrient.nutrientId === ENERGY_NUTRIENT_IDS.ENERGY_KCAL && nutrient.value > 0
      );
      if (hasCalories) score += 10;
      
      // Penalize very long descriptions (usually less relevant)
      if (foodDesc.length > 100) score -= 5;
      
      return { food, score };
    });

    // Sort by score descending
    scoredFoods.sort((a, b) => b.score - a.score);
    
    // Return best match if it has a reasonable score, otherwise return first food
    const bestScored = scoredFoods[0];
    if (bestScored && bestScored.score > 20) {
      return bestScored.food;
    }
    
    // Fallback to first food if available
    return foods[0] || null;
  }

  /**
   * Extract macronutrients per 100g from food nutrients
   */
  private extractMacronutrientsPer100g(food: USDAFood) {
    const getNutrientValue = (nutrientId: number): number => {
      const nutrient = food.foodNutrients.find(n => n.nutrientId === nutrientId);
      return nutrient?.value || 0;
    };

    return {
      protein: getNutrientValue(MACRONUTRIENT_IDS.PROTEIN),
      total_fat: getNutrientValue(MACRONUTRIENT_IDS.TOTAL_FAT),
      carbohydrates: getNutrientValue(MACRONUTRIENT_IDS.CARBS),
      fiber: getNutrientValue(MACRONUTRIENT_IDS.FIBER) || undefined,
      sugars: getNutrientValue(MACRONUTRIENT_IDS.SUGARS) || undefined,
      saturated_fat: getNutrientValue(MACRONUTRIENT_IDS.SATURATED_FAT) || undefined,
    };
  }

  /**
   * Extract calories per 100g from food nutrients
   */
  private extractCaloriesPer100g(food: USDAFood): number {
    // Prioritize kcal over kJ
    const kcalNutrient = food.foodNutrients.find(nutrient => 
      nutrient.nutrientId === ENERGY_NUTRIENT_IDS.ENERGY_KCAL
    );
    
    if (kcalNutrient && kcalNutrient.value > 0) {
      return kcalNutrient.value;
    }
    
    // Fallback to kJ and convert to kcal (1 kcal = 4.184 kJ)
    const kjNutrient = food.foodNutrients.find(nutrient => 
      nutrient.nutrientId === ENERGY_NUTRIENT_IDS.ENERGY_KJ
    );
    
    if (kjNutrient && kjNutrient.value > 0) {
      return Math.round(kjNutrient.value / 4.184);
    }
    
    return 0;
  }
  
  /**
   * Calculate serving size in grams
   */
  private calculateServingSize(food: USDAFood): number {
    // Use provided serving size if available
    if (food.servingSize && food.servingSize > 0) {
      // Convert to grams if needed
      if (food.servingSizeUnit?.toLowerCase().includes('g')) {
        return food.servingSize;
      }
      // For other units, use food measures if available
      if (food.foodMeasures && food.foodMeasures.length > 0) {
        const measure = food.foodMeasures.find(m => 
          m.measureUnitName.toLowerCase().includes(food.servingSizeUnit?.toLowerCase() || '')
        );
        if (measure) {
          return measure.gramWeight * food.servingSize;
        }
      }
    }
    
    // Use first food measure if available
    if (food.foodMeasures && food.foodMeasures.length > 0) {
      const primaryMeasure = food.foodMeasures[0];
      if (primaryMeasure) {
        return primaryMeasure.gramWeight;
      }
    }
    
    // Default to 100g
    return 100;
  }

  /**
   * Calculate calories for a dish and servings
   */
  async calculateCalories(dishName: string, servings: number): Promise<CalorieResponse> {
    try {
      if (!dishName || dishName.trim().length === 0) {
        throw new Error('Dish name cannot be empty');
      }

      if (servings <= 0) {
        throw new Error('Servings must be a positive number');
      }

      const foods = await this.searchFoods(dishName);
      
      if (foods.length === 0) {
        throw new Error(`No foods found for "${dishName}". Try a more specific or common food name.`);
      }

      const bestMatch = this.findBestMatch(foods, dishName);
      
      if (!bestMatch) {
        throw new Error(`No suitable match found for "${dishName}". Try a different search term.`);
      }

      logger.debug(`USDA food match found`, {
        query: dishName,
        matchedFood: bestMatch.description,
        fdcId: bestMatch.fdcId,
        dataType: bestMatch.dataType
      });

      const caloriesPer100g = this.extractCaloriesPer100g(bestMatch);
      
      if (caloriesPer100g === 0) {
        throw new Error(`No calorie information available for "${dishName}". The food "${bestMatch.description}" does not have energy data.`);
      }

      // Extract macronutrients per 100g
      const macronutrientsPer100g = this.extractMacronutrientsPer100g(bestMatch);

      // Calculate serving size in grams
      const servingSizeGrams = this.calculateServingSize(bestMatch);
      const caloriesPerServing = Math.round((caloriesPer100g * servingSizeGrams) / 100);
      const totalCalories = Math.round(caloriesPerServing * servings);

      // Calculate macronutrients per serving and total
      const macronutrientsPerServing = {
        protein: Math.round((macronutrientsPer100g.protein * servingSizeGrams) / 100 * 10) / 10,
        total_fat: Math.round((macronutrientsPer100g.total_fat * servingSizeGrams) / 100 * 10) / 10,
        carbohydrates: Math.round((macronutrientsPer100g.carbohydrates * servingSizeGrams) / 100 * 10) / 10,
        ...(macronutrientsPer100g.fiber && { 
          fiber: Math.round((macronutrientsPer100g.fiber * servingSizeGrams) / 100 * 10) / 10 
        }),
        ...(macronutrientsPer100g.sugars && { 
          sugars: Math.round((macronutrientsPer100g.sugars * servingSizeGrams) / 100 * 10) / 10 
        }),
        ...(macronutrientsPer100g.saturated_fat && { 
          saturated_fat: Math.round((macronutrientsPer100g.saturated_fat * servingSizeGrams) / 100 * 10) / 10 
        }),
      };

      const totalMacronutrients = {
        protein: Math.round(macronutrientsPerServing.protein * servings * 10) / 10,
        total_fat: Math.round(macronutrientsPerServing.total_fat * servings * 10) / 10,
        carbohydrates: Math.round(macronutrientsPerServing.carbohydrates * servings * 10) / 10,
        ...(macronutrientsPerServing.fiber && { 
          fiber: Math.round(macronutrientsPerServing.fiber * servings * 10) / 10 
        }),
        ...(macronutrientsPerServing.sugars && { 
          sugars: Math.round(macronutrientsPerServing.sugars * servings * 10) / 10 
        }),
        ...(macronutrientsPerServing.saturated_fat && { 
          saturated_fat: Math.round(macronutrientsPerServing.saturated_fat * servings * 10) / 10 
        }),
      };

      // Build ingredient breakdown with additional info
      const ingredientBreakdown = [{
        name: bestMatch.description,
        calories_per_100g: caloriesPer100g,
        macronutrients_per_100g: {
          protein: Math.round(macronutrientsPer100g.protein * 10) / 10,
          total_fat: Math.round(macronutrientsPer100g.total_fat * 10) / 10,
          carbohydrates: Math.round(macronutrientsPer100g.carbohydrates * 10) / 10,
          ...(macronutrientsPer100g.fiber && { fiber: Math.round(macronutrientsPer100g.fiber * 10) / 10 }),
          ...(macronutrientsPer100g.sugars && { sugars: Math.round(macronutrientsPer100g.sugars * 10) / 10 }),
          ...(macronutrientsPer100g.saturated_fat && { saturated_fat: Math.round(macronutrientsPer100g.saturated_fat * 10) / 10 }),
        },
        serving_size: `${servingSizeGrams}g`,
        data_type: bestMatch.dataType,
        fdc_id: bestMatch.fdcId,
        ...(bestMatch.brandOwner && { brand: bestMatch.brandOwner }),
        ...(bestMatch.foodCategory && { category: bestMatch.foodCategory.description })
      }];

      return {
        dish_name: dishName,
        servings,
        calories_per_serving: caloriesPerServing,
        total_calories: totalCalories,
        macronutrients_per_serving: macronutrientsPerServing,
        total_macronutrients: totalMacronutrients,
        source: 'USDA FoodData Central',
        ingredient_breakdown: ingredientBreakdown,
        // Additional metadata
        matched_food: {
          name: bestMatch.description,
          fdc_id: bestMatch.fdcId,
          data_type: bestMatch.dataType,
          published_date: bestMatch.publishedDate
        }
      };
    } catch (error) {
      logger.error('Error calculating calories:', error);
      
      // Re-throw with original message if it's already a user-friendly error
      if (error instanceof Error && (
        error.message.includes('No foods found') ||
        error.message.includes('No suitable match found') ||
        error.message.includes('No calorie information available') ||
        error.message.includes('Dish name cannot be empty') ||
        error.message.includes('Servings must be positive')
      )) {
        throw error;
      }
      
      // Generic error for unexpected issues
      throw new Error('Unable to calculate calories. Please try again or use a different food name.');
    }
  }
}

export default new USDAService(); 