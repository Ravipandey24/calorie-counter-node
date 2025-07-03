import { z } from 'zod';

// Authentication Schemas
export const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Calorie Calculation Schema
export const getCaloriesSchema = z.object({
  dish_name: z.string().min(1, 'Dish name is required'),
  servings: z.number().positive('Servings must be a positive number'),
});

// Response Types
export interface AuthResponse {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  token: string;
}

export interface CalorieResponse {
  dish_name: string;
  servings: number;
  calories_per_serving: number;
  total_calories: number;
  macronutrients_per_serving?: {
    protein: number;        // grams
    total_fat: number;      // grams
    carbohydrates: number;  // grams
    fiber?: number;         // grams
    sugars?: number;        // grams
    saturated_fat?: number; // grams
  };
  total_macronutrients?: {
    protein: number;        // grams
    total_fat: number;      // grams
    carbohydrates: number;  // grams
    fiber?: number;         // grams
    sugars?: number;        // grams
    saturated_fat?: number; // grams
  };
  source: string;
  ingredient_breakdown?: Array<{
    name: string;
    calories_per_100g: number;
    macronutrients_per_100g?: {
      protein: number;        // grams
      total_fat: number;      // grams
      carbohydrates: number;  // grams
      fiber?: number;         // grams
      sugars?: number;        // grams
      saturated_fat?: number; // grams
    };
    serving_size?: string;
    data_type?: string;
    fdc_id?: number;
    brand?: string;
    category?: string;
  }>;
  matched_food?: {
    name: string;
    fdc_id: number;
    data_type: string;
    published_date: string;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  status_code: number;
}

// USDA API Types - Official FoodData Central API structure
export interface USDAFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  derivationCode?: string;
  derivationDescription?: string;
  derivationId?: number;
  value: number;
  foodNutrientSourceId?: number;
  foodNutrientSourceCode?: string;
  foodNutrientSourceDescription?: string;
  rank?: number;
  indentLevel?: number;
  foodNutrientId?: number;
}

export interface USDAFoodCategory {
  id: number;
  code: string;
  description: string;
}

export interface USDAFoodAttribute {
  id: number;
  sequenceNumber: number;
  value: string;
  foodAttributeType: {
    id: number;
    name: string;
    description: string;
  };
}

export interface USDAFood {
  fdcId: number;
  description: string;
  lowercaseDescription: string;
  dataType: string;
  gtinUpc?: string;
  publishedDate: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  marketCountry?: string;
  foodCategory?: USDAFoodCategory;
  allHighlightFields?: string;
  score?: number;
  microbes?: any[];
  foodNutrients: USDAFoodNutrient[];
  finalFoodInputFoods?: any[];
  foodMeasures?: Array<{
    disseminationText: string;
    gramWeight: number;
    id: number;
    modifier: string;
    rank: number;
    measureUnitAbbreviation: string;
    measureUnitName: string;
  }>;
  foodAttributes?: USDAFoodAttribute[];
  foodVersionIds?: number[];
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
}

export interface USDASearchCriteria {
  query: string;
  dataType?: string[];
  pageSize?: number;
  pageNumber?: number;
  sortBy?: string;
  sortOrder?: string;
  brandOwner?: string;
  tradeChannel?: string[];
  startDate?: string;
  endDate?: string;
}

export interface USDASearchResponse {
  foodSearchCriteria: USDASearchCriteria;
  totalHits: number;
  currentPage: number;
  totalPages: number;
  pageList: number[];
  foods: USDAFood[];
  aggregations?: {
    dataType?: Record<string, number>;
    nutrients?: Record<string, number>;
  };
}

// Nutrient IDs for energy (calories) and macronutrients
export const ENERGY_NUTRIENT_IDS = {
  ENERGY_KCAL: 1008, // Energy (kcal)
  ENERGY_KJ: 1062,   // Energy (kJ)  
} as const;

export const MACRONUTRIENT_IDS = {
  PROTEIN: 1003,      // Protein (g)
  TOTAL_FAT: 1004,    // Total lipid (fat) (g)
  CARBS: 1005,        // Carbohydrate, by difference (g)
  FIBER: 1079,        // Fiber, total dietary (g)
  SUGARS: 2000,       // Sugars, total including NLEA (g)
  SATURATED_FAT: 1258, // Fatty acids, total saturated (g)
} as const;

// Export type inference
export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type GetCaloriesRequest = z.infer<typeof getCaloriesSchema>; 