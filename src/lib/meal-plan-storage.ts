// Meal Plan Storage - saves/loads meal plans to/from localStorage

import { LLMDayPlan } from './llm-service';

export interface SavedMealPlan {
  id: string;
  savedAt: string; // ISO date
  name: string;
  mealPlan: LLMDayPlan[];
  userProfile: {
    age: number;
    gender: string;
    weight: number;
    height: number;
    calories: number;
  };
  provider: 'ai' | 'fallback';
}

const STORAGE_KEY = 'keto-saved-meal-plans';
const MAX_PLANS = 20;

export function saveMealPlan(
  mealPlan: LLMDayPlan[],
  userProfile: SavedMealPlan['userProfile'],
  provider: 'ai' | 'fallback'
): SavedMealPlan {
  const plans = getAllSavedPlans();

  const saved: SavedMealPlan = {
    id: generateId(),
    savedAt: new Date().toISOString(),
    name: `Plan ${plans.length + 1} — ${new Date().toLocaleDateString()}`,
    mealPlan,
    userProfile,
    provider,
  };

  plans.unshift(saved); // newest first

  // Keep max 20 plans
  const trimmed = plans.slice(0, MAX_PLANS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

  return saved;
}

export function getAllSavedPlans(): SavedMealPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function deleteSavedPlan(id: string): void {
  const plans = getAllSavedPlans().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function updatePlanName(id: string, newName: string): void {
  const plans = getAllSavedPlans();
  const plan = plans.find(p => p.id === id);
  if (plan) {
    plan.name = newName;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
