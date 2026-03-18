import fs from 'fs';
import path from 'path';

import { describe, it, expect } from 'vitest';

import { parseMealPlan } from '@/lib/parser';
import { mealPlanSchema } from '@/lib/schema';

const markdown = fs.readFileSync(path.join(__dirname, '../data/meal-plan.md'), 'utf-8');

describe('parseMealPlan', () => {
  // Breakfast tests
  it('extracts fixed breakfast smoothie ingredients', () => {
    const plan = parseMealPlan(markdown);
    expect(plan.fixedBreakfast.smoothie).toHaveLength(4);
    expect(plan.fixedBreakfast.smoothie[0]).toEqual({ name: '无糖豆浆', amount: 350, unit: 'ml' });
  });

  it('extracts breakfast content for each person', () => {
    const plan = parseMealPlan(markdown);
    expect(plan.fixedBreakfast.you).toContain('2个青菜包子');
    expect(plan.fixedBreakfast.wife).toContain('1个青菜包子');
  });

  // Week plan tests
  it('extracts 7 day plans', () => {
    const plan = parseMealPlan(markdown);
    expect(plan.weekPlan).toHaveLength(7);
  });

  it('day 1 is shrimp day with correct menu', () => {
    const plan = parseMealPlan(markdown);
    const day1 = plan.weekPlan[0];
    expect(day1.day).toBe(1);
    expect(day1.dayType).toBe('虾仁日');
    expect(day1.menu).toContain('番茄虾仁');
  });

  it('day 1 has correct weighing data for you', () => {
    const plan = parseMealPlan(markdown);
    const day1 = plan.weekPlan[0];
    expect(day1.you.rice).toBe(352);
    expect(day1.you.protein.name).toBe('虾仁');
    expect(day1.you.protein.amount).toBe(310.9);
    expect(day1.you.vegetable).toBe(500);
    expect(day1.you.oil).toBe(11.6);
    expect(day1.you.powder).toBe(53.6);
  });

  it('day 1 has correct weighing data for wife', () => {
    const plan = parseMealPlan(markdown);
    const day1 = plan.weekPlan[0];
    expect(day1.wife.rice).toBe(145);
    expect(day1.wife.protein.name).toBe('虾仁');
    expect(day1.wife.protein.amount).toBe(103.7);
  });

  it('day 2 is beef day with correct templates', () => {
    const plan = parseMealPlan(markdown);
    const day2 = plan.weekPlan[1];
    expect(day2.dayType).toBe('牛肉日');
    expect(day2.you.protein.name).toBe('牛腿肉');
    expect(day2.you.protein.amount).toBe(340.1);
    expect(day2.wife.protein.name).toBe('牛腿肉');
    expect(day2.wife.protein.amount).toBe(160.0);
  });

  // Shopping list tests
  it('extracts shopping list with all categories', () => {
    const plan = parseMealPlan(markdown);
    expect(plan.shoppingList.breakfast.length).toBeGreaterThan(0);
    expect(plan.shoppingList.protein.length).toBeGreaterThan(0);
    expect(plan.shoppingList.vegetable.length).toBeGreaterThan(0);
  });

  it('shopping items have stable IDs', () => {
    const plan = parseMealPlan(markdown);
    const item = plan.shoppingList.breakfast[0];
    expect(item.id).toBeTruthy();
    expect(item.id).toContain('breakfast:');
  });

  it('shopping items have structured quantity', () => {
    const plan = parseMealPlan(markdown);
    const baozi = plan.shoppingList.breakfast.find((i) => i.name === '青菜包子');
    expect(baozi?.quantity).toBe(21);
    expect(baozi?.unit).toBe('个');
    expect(baozi?.displayAmount).toBe('21 个');
  });

  it('splits oil and pantry from the same source section', () => {
    const plan = parseMealPlan(markdown);
    // 食用油 has a specific amount → goes to oil category
    expect(plan.shoppingList.oil).toHaveLength(1);
    expect(plan.shoppingList.oil[0].name).toBe('食用油');
    expect(plan.shoppingList.oil[0].quantity).toBe(102.6);
    // 调味料 are all "适量" → go to pantry category
    expect(plan.shoppingList.pantry.length).toBeGreaterThanOrEqual(5);
    expect(plan.shoppingList.pantry.every((i) => i.quantity === null)).toBe(true);
  });

  // Recipe tests
  it('extracts 7 recipes', () => {
    const plan = parseMealPlan(markdown);
    expect(plan.recipes).toHaveLength(7);
  });

  it('recipe has steps', () => {
    const plan = parseMealPlan(markdown);
    expect(plan.recipes[0].steps.length).toBeGreaterThan(0);
  });

  // Meal prep tips & reminders
  it('extracts meal prep tips', () => {
    const plan = parseMealPlan(markdown);
    expect(plan.mealPrepTips.length).toBeGreaterThan(0);
  });

  it('extracts execution reminders', () => {
    const plan = parseMealPlan(markdown);
    expect(plan.executionReminders.length).toBeGreaterThan(0);
    expect(plan.executionReminders.some((r) => r.includes('熟重'))).toBe(true);
  });

  // Full zod validation
  it('full parsed result passes zod schema validation', () => {
    const plan = parseMealPlan(markdown);
    const result = mealPlanSchema.safeParse(plan);
    if (!result.success) console.error(result.error.format());
    expect(result.success).toBe(true);
  });
});
