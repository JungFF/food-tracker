import fs from 'fs';
import path from 'path';

import { parseMealPlan } from './parser';
import { mealPlanSchema } from './schema';
import type { DayPlan, Locale, MealPlan, ShoppingList } from './types';

const cache: Record<Locale, MealPlan | null> = { zh: null, en: null };

const FILE_MAP: Record<Locale, string> = {
  zh: 'data/meal-plan.md',
  en: 'data/meal-plan.en.md',
};

function loadMealPlan(locale: Locale): MealPlan {
  if (cache[locale]) return cache[locale];
  const md = fs.readFileSync(path.join(process.cwd(), FILE_MAP[locale]), 'utf-8');
  const parsed = parseMealPlan(md);
  const validated = mealPlanSchema.parse(parsed);
  cache[locale] = validated;
  return validated;
}

export function getMealPlan(locale: Locale): MealPlan {
  return loadMealPlan(locale);
}

export function getDayPlan(day: number, locale: Locale): DayPlan {
  if (day < 1 || day > 7) throw new Error(`Invalid day: ${day}`);
  const plan = loadMealPlan(locale);
  const found = plan.weekPlan.find((d) => d.day === day);
  if (!found) throw new Error(`Day ${day} not found`);
  return found;
}

export function getShoppingList(locale: Locale): ShoppingList {
  return loadMealPlan(locale).shoppingList;
}
