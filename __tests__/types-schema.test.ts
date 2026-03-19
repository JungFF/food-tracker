import { describe, it, expect } from 'vitest';

import { mealPlanSchema } from '@/lib/schema';
import type { Locale } from '@/lib/types';

const validMealPlan = {
  fixedBreakfast: {
    smoothie: [
      { name: '无糖豆浆', amount: 350, unit: 'ml' },
      { name: '黄瓜', amount: 150, unit: 'g' },
    ],
    you: '2个青菜包子 + 2个水煮蛋 + 半杯奶昔',
    wife: '1个青菜包子 + 1个水煮蛋 + 半杯奶昔',
  },
  weekPlan: [
    {
      day: 1,
      dayType: '虾仁日',
      menu: '番茄虾仁 + 上海青 + 糙米',
      you: {
        rice: 352,
        protein: { name: '虾仁', amount: 310.9, weightBasis: 'raw' },
        vegetable: 500,
        oil: 11.6,
        powder: 53.6,
      },
      wife: {
        rice: 145,
        protein: { name: '虾仁', amount: 103.7, weightBasis: 'raw' },
        vegetable: 400,
        oil: 3.7,
        powder: 35.7,
      },
    },
  ],
  shoppingList: {
    breakfast: [
      {
        id: 'breakfast:baozi',
        name: '青菜包子',
        quantity: 21,
        unit: '个',
        displayAmount: '21 个',
        note: '你14个，老婆7个',
      },
    ],
    staple: [],
    protein: [],
    vegetable: [],
    oil: [],
    pantry: [],
  },
  recipes: [{ day: 1, title: '番茄虾仁 + 上海青', steps: ['虾仁解冻'] }],
  mealPrepTips: ['糙米已蒸好'],
  executionReminders: ['糙米按熟重称'],
};

describe('mealPlanSchema', () => {
  it('validates a correct MealPlan object', () => {
    const result = mealPlanSchema.safeParse(validMealPlan);
    expect(result.success).toBe(true);
  });

  describe('rejects invalid data', () => {
    it('rejects missing required top-level field (weekPlan)', () => {
      const { weekPlan: _removed, ...invalid } = validMealPlan;
      const result = mealPlanSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects invalid dayType', () => {
      const invalid = {
        ...validMealPlan,
        weekPlan: [
          {
            ...validMealPlan.weekPlan[0],
            dayType: '鸡肉日', // not in enum
          },
        ],
      };
      const result = mealPlanSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects negative amount in ingredient', () => {
      const invalid = {
        ...validMealPlan,
        fixedBreakfast: {
          ...validMealPlan.fixedBreakfast,
          smoothie: [{ name: '无糖豆浆', amount: -10, unit: 'ml' }],
        },
      };
      const result = mealPlanSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects negative protein amount', () => {
      const invalid = {
        ...validMealPlan,
        weekPlan: [
          {
            ...validMealPlan.weekPlan[0],
            you: {
              ...validMealPlan.weekPlan[0].you,
              protein: { name: '虾仁', amount: -5, weightBasis: 'raw' as const },
            },
          },
        ],
      };
      const result = mealPlanSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects day = 0 (out of range)', () => {
      const invalid = {
        ...validMealPlan,
        weekPlan: [{ ...validMealPlan.weekPlan[0], day: 0 }],
      };
      const result = mealPlanSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects day = 8 (out of range)', () => {
      const invalid = {
        ...validMealPlan,
        weekPlan: [{ ...validMealPlan.weekPlan[0], day: 8 }],
      };
      const result = mealPlanSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects non-integer day', () => {
      const invalid = {
        ...validMealPlan,
        weekPlan: [{ ...validMealPlan.weekPlan[0], day: 1.5 }],
      };
      const result = mealPlanSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects weightBasis other than raw', () => {
      const invalid = {
        ...validMealPlan,
        weekPlan: [
          {
            ...validMealPlan.weekPlan[0],
            you: {
              ...validMealPlan.weekPlan[0].you,
              protein: { name: '虾仁', amount: 100, weightBasis: 'cooked' },
            },
          },
        ],
      };
      const result = mealPlanSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects missing shoppingList category (pantry)', () => {
      const { pantry: _removed, ...shoppingListWithoutPantry } = validMealPlan.shoppingList;
      const invalid = {
        ...validMealPlan,
        shoppingList: shoppingListWithoutPantry,
      };
      const result = mealPlanSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  it('Locale type accepts zh and en', () => {
    const zh: Locale = 'zh';
    const en: Locale = 'en';
    expect(zh).toBe('zh');
    expect(en).toBe('en');
  });
});
