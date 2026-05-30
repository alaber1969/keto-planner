export interface UserData {
  age: number;
  gender: 'male' | 'female';
  weight: number; // in kg
  height: number; // in cm
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'super_active';
  goalWeightLoss: number; // lbs per week (1-2)
  targetWeight?: number; // in kg
}

export interface MacroTargets {
  calories: number;
  fat: number; // grams
  protein: number; // grams
  carbs: number; // grams
  fatPercentage: number;
  proteinPercentage: number;
  carbPercentage: number;
}

export interface WeightLossProjection {
  weeksToGoal: number;
  targetDate: Date;
  dailyDeficit: number;
  weeklyDeficit: number;
}

// BMR calculation using Mifflin-St Jeor equation (more accurate than Harris-Benedict)
export function calculateBMR(userData: UserData): number {
  const { age, gender, weight, height } = userData;
  
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// TDEE calculation with activity multipliers
export function calculateTDEE(userData: UserData): number {
  const bmr = calculateBMR(userData);
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    super_active: 1.9
  };
  
  return bmr * activityMultipliers[userData.activityLevel];
}

// Calculate daily calories for weight loss (safe deficit of 500-1000 calories per day)
export function calculateWeightLossCalories(userData: UserData): number {
  const tdee = calculateTDEE(userData);
  const dailyDeficit = userData.goalWeightLoss * 500; // 500 cal deficit = 1 lb/week
  
  const targetCalories = tdee - dailyDeficit;
  
  // Ensure minimum safe calorie intake
  const minCalories = userData.gender === 'male' ? 1500 : 1200;
  
  return Math.max(targetCalories, minCalories);
}

// Calculate macro distribution for ketogenic diet
export function calculateMacros(userData: UserData): MacroTargets {
  const calories = calculateWeightLossCalories(userData);
  
  // Standard Ketogenic Diet ratios
  const fatPercentage = 75; // 70-80%
  const proteinPercentage = 20; // 15-25%
  const carbPercentage = 5; // 5-10%
  
  // Calculate grams (fat: 9 cal/g, protein: 4 cal/g, carbs: 4 cal/g)
  const fatCalories = (calories * fatPercentage) / 100;
  const proteinCalories = (calories * proteinPercentage) / 100;
  const carbCalories = (calories * carbPercentage) / 100;
  
  const fatGrams = Math.round(fatCalories / 9);
  const proteinGrams = Math.round(proteinCalories / 4);
  const carbGrams = Math.round(carbCalories / 4);
  
  return {
    calories: Math.round(calories),
    fat: fatGrams,
    protein: proteinGrams,
    carbs: carbGrams,
    fatPercentage,
    proteinPercentage,
    carbPercentage
  };
}

// Calculate BMI
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

// Get BMI category
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// Calculate weight loss projection
export function calculateWeightLossProjection(userData: UserData): WeightLossProjection {
  const currentWeight = userData.weight;
  const targetWeight = userData.targetWeight || (currentWeight - 10); // Default 10kg loss
  const weightToLose = currentWeight - targetWeight;
  const weeklyLoss = userData.goalWeightLoss * 0.453592; // Convert lbs to kg
  
  const weeksToGoal = Math.ceil(weightToLose / weeklyLoss);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + (weeksToGoal * 7));
  
  const dailyDeficit = userData.goalWeightLoss * 500;
  const weeklyDeficit = dailyDeficit * 7;
  
  return {
    weeksToGoal,
    targetDate,
    dailyDeficit,
    weeklyDeficit
  };
}

// Convert pounds to kg
export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

// Convert kg to pounds
export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

// Convert feet/inches to cm
export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

// Convert cm to feet/inches
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

// Validate user input
export function validateUserData(userData: Partial<UserData>): string[] {
  const errors: string[] = [];
  
  if (!userData.age || userData.age < 18 || userData.age > 100) {
    errors.push('Age must be between 18 and 100 years');
  }
  
  if (!userData.weight || userData.weight < 40 || userData.weight > 300) {
    errors.push('Weight must be between 40 and 300 kg');
  }
  
  if (!userData.height || userData.height < 140 || userData.height > 220) {
    errors.push('Height must be between 140 and 220 cm');
  }
  
  if (!userData.goalWeightLoss || userData.goalWeightLoss < 0.5 || userData.goalWeightLoss > 2) {
    errors.push('Goal weight loss must be between 0.5 and 2 lbs per week for safety');
  }
  
  return errors;
}

// Calculate net carbs
export function calculateNetCarbs(totalCarbs: number, fiber: number): number {
  return Math.max(0, totalCarbs - fiber);
}

// Format macro display
export function formatMacro(value: number, unit: string = 'g'): string {
  return `${Math.round(value)}${unit}`;
}

// Calculate percentage of daily value
export function calculatePercentage(current: number, target: number): number {
  return Math.round((current / target) * 100);
}
