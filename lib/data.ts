import fs from 'fs';
import path from 'path';

import { parseMealPlan } from './parser';
import { mealPlanSchema } from './schema';
import type { MealPlan, DayPlan, ShoppingList } from './types';

let cached: MealPlan | null = null;

function loadMealPlan(): MealPlan {
  if (cached) return cached;
  const md = fs.readFileSync(path.join(process.cwd(), 'data/meal-plan.md'), 'utf-8');
  const parsed = parseMealPlan(md);
  const validated = mealPlanSchema.parse(parsed);
  cached = validated;
  return validated;
}

export function getMealPlan(): MealPlan {
  return loadMealPlan();
}

export function getDayPlan(day: number): DayPlan {
  if (day < 1 || day > 7) throw new Error(`Invalid day: ${day}`);
  const plan = loadMealPlan();
  const found = plan.weekPlan.find((d) => d.day === day);
  if (!found) throw new Error(`Day ${day} not found`);
  return found;
}

export function getShoppingList(): ShoppingList {
  return loadMealPlan().shoppingList;
}
