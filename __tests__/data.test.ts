import { describe, it, expect } from 'vitest';

import { getMealPlan, getDayPlan, getShoppingList } from '@/lib/data';

describe('getMealPlan', () => {
  it('returns a complete MealPlan', () => {
    const plan = getMealPlan();
    expect(plan.weekPlan).toHaveLength(7);
    expect(plan.fixedBreakfast.smoothie).toHaveLength(4);
  });
});

describe('getDayPlan', () => {
  it('returns correct plan for day 1', () => {
    const day = getDayPlan(1);
    expect(day.dayType).toBe('虾仁日');
  });

  it('returns correct plan for day 2', () => {
    const day = getDayPlan(2);
    expect(day.dayType).toBe('牛肉日');
  });

  it('throws for invalid day number', () => {
    expect(() => getDayPlan(0)).toThrow();
    expect(() => getDayPlan(8)).toThrow();
  });
});

describe('getShoppingList', () => {
  it('returns shopping list with all categories', () => {
    const list = getShoppingList();
    expect(list.breakfast.length).toBeGreaterThan(0);
    expect(list.protein.length).toBeGreaterThan(0);
  });
});
