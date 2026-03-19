import { describe, it, expect } from 'vitest';

import { getMealPlan, getDayPlan, getShoppingList } from '@/lib/data';

describe('getMealPlan', () => {
  it('returns a complete MealPlan for zh', () => {
    const plan = getMealPlan('zh');
    expect(plan.weekPlan).toHaveLength(7);
    expect(plan.fixedBreakfast.smoothie).toHaveLength(4);
  });

  it('returns a complete MealPlan for en', () => {
    const plan = getMealPlan('en');
    expect(plan.weekPlan).toHaveLength(7);
    expect(plan.fixedBreakfast.smoothie).toHaveLength(4);
  });

  it('caches per locale separately', () => {
    const zh = getMealPlan('zh');
    const en = getMealPlan('en');
    expect(zh).not.toBe(en);
    expect(getMealPlan('zh')).toBe(zh);
    expect(getMealPlan('en')).toBe(en);
  });
});

describe('getDayPlan', () => {
  it('returns correct plan for day 1 zh', () => {
    const day = getDayPlan(1, 'zh');
    expect(day.dayType).toBe('虾仁日');
  });

  it('returns correct plan for day 1 en', () => {
    const day = getDayPlan(1, 'en');
    expect(day.dayType).toBe('虾仁日');
  });

  it('returns correct plan for day 2', () => {
    const day = getDayPlan(2, 'zh');
    expect(day.dayType).toBe('牛肉日');
  });

  it('throws for invalid day number', () => {
    expect(() => getDayPlan(0, 'zh')).toThrow();
    expect(() => getDayPlan(8, 'zh')).toThrow();
  });
});

describe('getShoppingList', () => {
  it('returns shopping list for zh', () => {
    const list = getShoppingList('zh');
    expect(list.breakfast.length).toBeGreaterThan(0);
    expect(list.protein.length).toBeGreaterThan(0);
  });

  it('returns shopping list for en', () => {
    const list = getShoppingList('en');
    expect(list.breakfast.length).toBeGreaterThan(0);
    expect(list.protein.length).toBeGreaterThan(0);
  });
});
