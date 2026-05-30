// LLM Service - handles communication with the backend API for AI-generated meal plans

function getApiPath(): string {
  // 1. If user explicitly set VITE_API_URL, use that (custom backend deployment)
  const customUrl = import.meta.env.VITE_API_URL;
  if (customUrl) return `${customUrl}/api/generate-meal-plan`;

  // 2. On Netlify, call the serverless function directly
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('netlify.app') || host.includes('netlify')) {
      return '/.netlify/functions/generate-meal-plan';
    }
  }

  // 3. Local development — uses Vite proxy to localhost:3001
  return '/api/generate-meal-plan';
}

export interface LLMUserData {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  activityLevel: string;
  goalWeightLoss: number;
  macros: {
    calories: number;
    fat: number;
    protein: number;
    carbs: number;
    fatPercentage: number;
    proteinPercentage: number;
    carbPercentage: number;
  };
  dietaryPreferences?: string[];
  allergies?: string[];
  language?: string;
}

export interface LLMMeal {
  name: string;
  ingredients: Array<{ name: string; amount: number; unit: string }>;
  instructions: string;
  prepTime: number;
  calories: number;
  fat: number;
  protein: number;
  carbs: number;
  fiber: number;
}

export interface LLMDayPlan {
  day: number;
  dayName: string;
  breakfast: LLMMeal;
  lunch: LLMMeal;
  dinner: LLMMeal;
  snack: LLMMeal;
  totalCalories: number;
  totalFat: number;
  totalProtein: number;
  totalCarbs: number;
}

export interface LLMResponse {
  mealPlan: LLMDayPlan[];
}

export interface LLMError {
  error: string;
  details?: string;
}

/**
 * Generate a personalized 7-day keto meal plan using the LLM API.
 * @param userData - The user's data and macro targets
 * @returns The generated meal plan
 */
export async function generateMealPlan(userData: LLMUserData): Promise<LLMResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000); // 2-minute timeout

  try {
    const response = await fetch(getApiPath(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData: LLMError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data: LLMResponse = await response.json();

    // Validate the response structure
    if (!data.mealPlan || !Array.isArray(data.mealPlan) || data.mealPlan.length !== 7) {
      throw new Error('Invalid meal plan response from server');
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeout);

    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The AI is taking too long — please try again.');
    }

    // If it's a network error (no server/function running)
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      throw new Error(
        'Cannot connect to the AI service. ' +
        'Make sure the backend function is deployed correctly.'
      );
    }

    throw error;
  }
}

/**
 * Get a fallback/example meal plan when the LLM is unavailable.
 * This ensures the app is still usable without the AI backend.
 */
export function getFallbackMealPlan(): LLMResponse {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const meals = [
    {
      breakfast: { name: 'Scrambled Eggs with Avocado', ingredients: [{ name: 'Eggs', amount: 3, unit: 'large' }, { name: 'Avocado', amount: 1, unit: 'medium' }, { name: 'Butter', amount: 1, unit: 'tbsp' }], instructions: 'Scramble eggs in butter, serve with sliced avocado.', prepTime: 10, calories: 480, fat: 40, protein: 22, carbs: 5, fiber: 3 },
      lunch: { name: 'Grilled Salmon Salad', ingredients: [{ name: 'Salmon fillet', amount: 150, unit: 'g' }, { name: 'Spinach', amount: 100, unit: 'g' }, { name: 'Olive oil', amount: 2, unit: 'tbsp' }], instructions: 'Grill salmon, toss spinach with olive oil, serve together.', prepTime: 15, calories: 520, fat: 38, protein: 38, carbs: 4, fiber: 2 },
      dinner: { name: 'Beef Stir-fry with Cauliflower Rice', ingredients: [{ name: 'Beef strips', amount: 150, unit: 'g' }, { name: 'Cauliflower', amount: 200, unit: 'g' }, { name: 'Coconut oil', amount: 2, unit: 'tbsp' }, { name: 'Bell pepper', amount: 50, unit: 'g' }], instructions: 'Stir-fry beef and peppers in coconut oil, serve over riced cauliflower.', prepTime: 20, calories: 580, fat: 42, protein: 40, carbs: 10, fiber: 4 },
      snack: { name: 'Macadamia Nuts with Raspberries', ingredients: [{ name: 'Macadamia nuts', amount: 30, unit: 'g' }, { name: 'Raspberries', amount: 50, unit: 'g' }], instructions: 'Combine nuts and berries in a bowl.', prepTime: 2, calories: 220, fat: 18, protein: 3, carbs: 8, fiber: 5 },
    },
    {
      breakfast: { name: 'Keto Cheese Omelet', ingredients: [{ name: 'Eggs', amount: 3, unit: 'large' }, { name: 'Cheddar cheese', amount: 30, unit: 'g' }, { name: 'Butter', amount: 1, unit: 'tbsp' }], instructions: 'Beat eggs, cook in butter, add cheese, fold.', prepTime: 8, calories: 450, fat: 36, protein: 26, carbs: 2, fiber: 0 },
      lunch: { name: 'Chicken Thigh with Kale Salad', ingredients: [{ name: 'Chicken thigh', amount: 150, unit: 'g' }, { name: 'Kale', amount: 80, unit: 'g' }, { name: 'Olive oil', amount: 2, unit: 'tbsp' }, { name: 'Parmesan', amount: 15, unit: 'g' }], instructions: 'Roast chicken, massage kale with olive oil, top with parmesan.', prepTime: 25, calories: 540, fat: 40, protein: 36, carbs: 6, fiber: 3 },
      dinner: { name: 'Baked Salmon with Asparagus', ingredients: [{ name: 'Salmon fillet', amount: 180, unit: 'g' }, { name: 'Asparagus', amount: 150, unit: 'g' }, { name: 'Butter', amount: 2, unit: 'tbsp' }], instructions: 'Bake salmon at 400°F for 15min, roast asparagus with butter.', prepTime: 25, calories: 560, fat: 38, protein: 44, carbs: 6, fiber: 3 },
      snack: { name: 'Celery with Almond Butter', ingredients: [{ name: 'Celery stalks', amount: 2, unit: 'medium' }, { name: 'Almond butter', amount: 2, unit: 'tbsp' }], instructions: 'Spread almond butter on celery sticks.', prepTime: 2, calories: 200, fat: 16, protein: 5, carbs: 7, fiber: 4 },
    },
    {
      breakfast: { name: 'Bulletproof Coffee with Berries', ingredients: [{ name: 'Coffee', amount: 1, unit: 'cup' }, { name: 'Butter', amount: 1, unit: 'tbsp' }, { name: 'Coconut oil', amount: 1, unit: 'tbsp' }, { name: 'Strawberries', amount: 50, unit: 'g' }], instructions: 'Blend hot coffee with butter and coconut oil. Serve with berries.', prepTime: 5, calories: 310, fat: 28, protein: 2, carbs: 5, fiber: 1 },
      lunch: { name: 'Tuna Avocado Wraps', ingredients: [{ name: 'Canned tuna', amount: 120, unit: 'g' }, { name: 'Avocado', amount: 1, unit: 'medium' }, { name: 'Lettuce leaves', amount: 4, unit: 'large' }], instructions: 'Mix tuna with diced avocado, wrap in lettuce leaves.', prepTime: 10, calories: 480, fat: 32, protein: 38, carbs: 6, fiber: 4 },
      dinner: { name: 'Pork Chops with Garlic Broccoli', ingredients: [{ name: 'Pork chops', amount: 150, unit: 'g' }, { name: 'Broccoli', amount: 150, unit: 'g' }, { name: 'Butter', amount: 2, unit: 'tbsp' }, { name: 'Garlic', amount: 2, unit: 'cloves' }], instructions: 'Pan-sear pork chops, sauté broccoli in butter and garlic.', prepTime: 18, calories: 550, fat: 38, protein: 42, carbs: 8, fiber: 3 },
      snack: { name: 'Hard-boiled Eggs with Salt', ingredients: [{ name: 'Eggs', amount: 2, unit: 'large' }], instructions: 'Boil eggs for 8 minutes, peel and season with salt.', prepTime: 10, calories: 140, fat: 10, protein: 12, carbs: 1, fiber: 0 },
    },
    {
      breakfast: { name: 'Keto Smoothie', ingredients: [{ name: 'Almond milk', amount: 200, unit: 'ml' }, { name: 'Spinach', amount: 30, unit: 'g' }, { name: 'Peanut butter', amount: 2, unit: 'tbsp' }, { name: 'Protein powder', amount: 1, unit: 'scoop' }], instructions: 'Blend all ingredients until smooth.', prepTime: 5, calories: 380, fat: 24, protein: 30, carbs: 8, fiber: 3 },
      lunch: { name: 'Bunless Burger with Cheese', ingredients: [{ name: 'Beef patty', amount: 120, unit: 'g' }, { name: 'Cheddar cheese', amount: 40, unit: 'g' }, { name: 'Lettuce', amount: 3, unit: 'leaves' }, { name: 'Tomato', amount: 30, unit: 'g' }], instructions: 'Grill patty, top with cheese, serve in lettuce wrap.', prepTime: 12, calories: 520, fat: 40, protein: 36, carbs: 5, fiber: 2 },
      dinner: { name: 'Shrimp with Zucchini Noodles', ingredients: [{ name: 'Shrimp', amount: 150, unit: 'g' }, { name: 'Zucchini', amount: 200, unit: 'g' }, { name: 'Garlic butter', amount: 2, unit: 'tbsp' }, { name: 'Parmesan', amount: 15, unit: 'g' }], instructions: 'Sauté shrimp in garlic butter, toss with zucchini noodles and parmesan.', prepTime: 15, calories: 480, fat: 32, protein: 40, carbs: 7, fiber: 2 },
      snack: { name: 'Full-fat Greek Yogurt', ingredients: [{ name: 'Greek yogurt', amount: 150, unit: 'g' }, { name: 'Walnuts', amount: 20, unit: 'g' }], instructions: 'Top yogurt with crushed walnuts.', prepTime: 2, calories: 180, fat: 12, protein: 14, carbs: 5, fiber: 1 },
    },
    {
      breakfast: { name: 'Smoked Salmon Cream Cheese Roll-ups', ingredients: [{ name: 'Smoked salmon', amount: 100, unit: 'g' }, { name: 'Cream cheese', amount: 2, unit: 'tbsp' }, { name: 'Cucumber', amount: 50, unit: 'g' }], instructions: 'Spread cream cheese on salmon, roll with cucumber strips.', prepTime: 10, calories: 350, fat: 24, protein: 28, carbs: 3, fiber: 1 },
      lunch: { name: 'Cauliflower Mac and Cheese', ingredients: [{ name: 'Cauliflower', amount: 200, unit: 'g' }, { name: 'Cheddar cheese', amount: 50, unit: 'g' }, { name: 'Heavy cream', amount: 50, unit: 'ml' }, { name: 'Butter', amount: 1, unit: 'tbsp' }], instructions: 'Steam cauliflower, mix with cheese sauce made from cream and cheddar.', prepTime: 20, calories: 480, fat: 38, protein: 22, carbs: 8, fiber: 3 },
      dinner: { name: 'Lamb Chops with Mint Sauce', ingredients: [{ name: 'Lamb chops', amount: 180, unit: 'g' }, { name: 'Mint leaves', amount: 10, unit: 'g' }, { name: 'Olive oil', amount: 2, unit: 'tbsp' }, { name: 'Green beans', amount: 100, unit: 'g' }], instructions: 'Grill lamb chops to preference, serve with sautéed green beans and mint sauce.', prepTime: 20, calories: 620, fat: 45, protein: 46, carbs: 6, fiber: 3 },
      snack: { name: 'Avocado Cocoa Mousse', ingredients: [{ name: 'Avocado', amount: 1, unit: 'medium' }, { name: 'Cocoa powder', amount: 1, unit: 'tbsp' }, { name: 'Stevia', amount: 1, unit: 'packet' }], instructions: 'Blend all ingredients until smooth and creamy.', prepTime: 5, calories: 200, fat: 16, protein: 3, carbs: 8, fiber: 5 },
    },
    {
      breakfast: { name: 'Sausage and Egg Muffins', ingredients: [{ name: 'Eggs', amount: 3, unit: 'large' }, { name: 'Sausage patties', amount: 2, unit: 'patties' }, { name: 'Cheddar cheese', amount: 30, unit: 'g' }], instructions: 'Line muffin tin with sausage, pour beaten eggs, top with cheese, bake at 350°F for 15min.', prepTime: 20, calories: 520, fat: 42, protein: 30, carbs: 2, fiber: 0 },
      lunch: { name: 'Cobb Salad', ingredients: [{ name: 'Romaine lettuce', amount: 100, unit: 'g' }, { name: 'Grilled chicken', amount: 120, unit: 'g' }, { name: 'Bacon bits', amount: 20, unit: 'g' }, { name: 'Blue cheese', amount: 30, unit: 'g' }, { name: 'Avocado', amount: 0.5, unit: 'medium' }], instructions: 'Chop all ingredients, arrange on lettuce, serve with olive oil dressing.', prepTime: 15, calories: 510, fat: 36, protein: 38, carbs: 6, fiber: 3 },
      dinner: { name: 'Chicken Alfredo with Zucchini', ingredients: [{ name: 'Chicken breast', amount: 150, unit: 'g' }, { name: 'Zucchini', amount: 200, unit: 'g' }, { name: 'Heavy cream', amount: 100, unit: 'ml' }, { name: 'Parmesan', amount: 30, unit: 'g' }], instructions: 'Cook chicken, make alfredo sauce with cream and parmesan, toss with zucchini noodles.', prepTime: 20, calories: 580, fat: 42, protein: 44, carbs: 7, fiber: 2 },
      snack: { name: 'Cheese Crisps', ingredients: [{ name: 'Cheddar cheese', amount: 50, unit: 'g' }], instructions: 'Bake small piles of shredded cheese at 400°F for 5-7 min until crispy.', prepTime: 10, calories: 180, fat: 15, protein: 12, carbs: 1, fiber: 0 },
    },
    {
      breakfast: { name: 'Coconut Flour Pancakes', ingredients: [{ name: 'Eggs', amount: 2, unit: 'large' }, { name: 'Coconut flour', amount: 2, unit: 'tbsp' }, { name: 'Coconut oil', amount: 1, unit: 'tbsp' }, { name: 'Sugar-free syrup', amount: 1, unit: 'tbsp' }], instructions: 'Mix eggs and coconut flour, cook in coconut oil, serve with syrup.', prepTime: 12, calories: 380, fat: 28, protein: 14, carbs: 8, fiber: 4 },
      lunch: { name: 'Egg Salad Lettuce Wraps', ingredients: [{ name: 'Eggs', amount: 3, unit: 'large' }, { name: 'Mayonnaise', amount: 2, unit: 'tbsp' }, { name: 'Lettuce leaves', amount: 4, unit: 'large' }, { name: 'Celery', amount: 30, unit: 'g' }], instructions: 'Chop boiled eggs, mix with mayo and diced celery, serve in lettuce cups.', prepTime: 10, calories: 420, fat: 36, protein: 20, carbs: 4, fiber: 1 },
      dinner: { name: 'Steak with Creamed Spinach', ingredients: [{ name: 'Ribeye steak', amount: 180, unit: 'g' }, { name: 'Spinach', amount: 200, unit: 'g' }, { name: 'Heavy cream', amount: 80, unit: 'ml' }, { name: 'Butter', amount: 2, unit: 'tbsp' }], instructions: 'Pan-sear steak to preference, wilt spinach in butter and cream.', prepTime: 20, calories: 680, fat: 52, protein: 48, carbs: 6, fiber: 2 },
      snack: { name: 'Olives and Cheese Plate', ingredients: [{ name: 'Mixed olives', amount: 50, unit: 'g' }, { name: 'Mozzarella pearls', amount: 50, unit: 'g' }], instructions: 'Arrange olives and cheese on a small plate.', prepTime: 2, calories: 190, fat: 16, protein: 8, carbs: 2, fiber: 1 },
    },
  ];

  const macrosPerDay = [
    { calories: 1800, fat: 138, protein: 102, carbs: 21 },
    { calories: 1750, fat: 134, protein: 104, carbs: 20 },
    { calories: 1480, fat: 108, protein: 96, carbs: 20 },
    { calories: 1560, fat: 108, protein: 118, carbs: 21 },
    { calories: 1650, fat: 123, protein: 99, carbs: 18 },
    { calories: 1790, fat: 135, protein: 122, carbs: 16 },
    { calories: 1670, fat: 132, protein: 90, carbs: 20 },
  ];

  return {
    mealPlan: meals.map((meal, index) => ({
      day: index + 1,
      dayName: dayNames[index],
      breakfast: meal.breakfast,
      lunch: meal.lunch,
      dinner: meal.dinner,
      snack: meal.snack,
      totalCalories: macrosPerDay[index].calories,
      totalFat: macrosPerDay[index].fat,
      totalProtein: macrosPerDay[index].protein,
      totalCarbs: macrosPerDay[index].carbs,
    })),
  };
}
