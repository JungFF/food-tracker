import { z } from 'zod';

import type {
  MealPlan,
  FixedBreakfast,
  Ingredient,
  ProteinItem,
  PersonWeighing,
  DayPlan,
  Recipe,
  ShoppingList,
  ShoppingItem,
} from './types';

export const ingredientSchema: z.ZodType<Ingredient> = z.object({
  name: z.string(),
  amount: z.number().nonnegative(),
  unit: z.string(),
});

export const fixedBreakfastSchema: z.ZodType<FixedBreakfast> = z.object({
  smoothie: z.array(ingredientSchema),
  you: z.string(),
  wife: z.string(),
});

export const proteinItemSchema: z.ZodType<ProteinItem> = z.object({
  name: z.string(),
  amount: z.number().nonnegative(),
  weightBasis: z.literal('raw'),
});

export const personWeighingSchema: z.ZodType<PersonWeighing> = z.object({
  rice: z.number().nonnegative(),
  protein: proteinItemSchema,
  vegetable: z.number().nonnegative(),
  oil: z.number().nonnegative(),
  powder: z.number().nonnegative(),
});

export const dayPlanSchema: z.ZodType<DayPlan> = z.object({
  day: z.number().int().min(1).max(7),
  dayType: z.enum(['虾仁日', '牛肉日']),
  menu: z.string(),
  you: personWeighingSchema,
  wife: personWeighingSchema,
});

export const recipeSchema: z.ZodType<Recipe> = z.object({
  day: z.number().int().min(1).max(7),
  title: z.string(),
  steps: z.array(z.string()),
});

export const shoppingItemSchema: z.ZodType<ShoppingItem> = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().nullable(),
  unit: z.string().nullable(),
  displayAmount: z.string(),
  note: z.string().optional(),
});

export const shoppingListSchema: z.ZodType<ShoppingList> = z.object({
  breakfast: z.array(shoppingItemSchema),
  staple: z.array(shoppingItemSchema),
  protein: z.array(shoppingItemSchema),
  vegetable: z.array(shoppingItemSchema),
  oil: z.array(shoppingItemSchema),
  pantry: z.array(shoppingItemSchema),
});

export const mealPlanSchema: z.ZodType<MealPlan> = z.object({
  fixedBreakfast: fixedBreakfastSchema,
  weekPlan: z.array(dayPlanSchema),
  shoppingList: shoppingListSchema,
  recipes: z.array(recipeSchema),
  mealPrepTips: z.array(z.string()),
  executionReminders: z.array(z.string()),
});
