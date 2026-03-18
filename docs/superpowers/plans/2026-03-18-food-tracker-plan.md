# Food Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **TDD is mandatory.** Use superpowers:test-driven-development for every task that involves business logic. NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.
>
> **Before final delivery:** Run simplify skill → code-reviewer agent review → run all tests. All must pass before handing off to user.

**Goal:** Build a responsive meal-plan tracker website that shows daily weighing data and a weekly shopping checklist, parsed from a Markdown source file.

**Architecture:** Next.js static export with client-side date selection and localStorage for shopping checklist state. Data parsed from Markdown at build time via zod-validated parser. Unified data access layer for future extensibility.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, zod, Vitest, Playwright, husky + lint-staged, ESLint, Prettier

**Spec:** `docs/superpowers/specs/2026-03-18-food-tracker-design.md`
**Source data:** `/Users/wang/Downloads/couple_diet_plan_final_cooked_rice.md`

---

## File Structure

```
food-tracker/
├── data/
│   └── meal-plan.md                    # Copy of source Markdown
├── lib/
│   ├── types.ts                        # TypeScript interfaces (MealPlan, DayPlan, etc.)
│   ├── schema.ts                       # Zod schemas matching types.ts
│   ├── parser.ts                       # Markdown → MealPlan parser
│   ├── date-utils.ts                   # getTodayDayNumber, getDayLabel, etc.
│   ├── data.ts                         # Data access layer (getMealPlan, getDayPlan, getShoppingList)
│   └── shopping-storage.ts             # localStorage wrapper for shopping checklist
├── app/
│   ├── layout.tsx                      # Root layout with BottomNav
│   ├── globals.css                     # Tailwind directives + custom theme
│   ├── page.tsx                        # Homepage (daily overview)
│   └── shopping/
│       └── page.tsx                    # Shopping list page
├── components/
│   ├── DayNavigation.tsx               # Client component: date selector with arrows
│   ├── DayContent.tsx                  # Server component: menu + weighing + recipe for a day
│   ├── WeighingCard.tsx                # Person weighing card
│   ├── CollapsibleSection.tsx          # Expandable section with aria-expanded
│   ├── BreakfastSection.tsx            # Smoothie always visible + collapsible details
│   ├── ShoppingChecklist.tsx           # Client component: checklist with localStorage
│   ├── ShoppingCategory.tsx            # Category group with items
│   ├── ShoppingItemRow.tsx             # Single shopping item with checkbox
│   └── BottomNav.tsx                   # Bottom tab navigation
├── __tests__/
│   ├── types-schema.test.ts            # Zod schema validation tests
│   ├── parser.test.ts                  # Markdown parser tests
│   ├── date-utils.test.ts             # Date utility tests
│   ├── data.test.ts                    # Data access layer tests
│   └── shopping-storage.test.ts        # localStorage wrapper tests
├── e2e/
│   └── smoke.spec.ts                   # Playwright E2E smoke tests
├── package.json
├── next.config.ts                      # Static export config
├── tailwind.config.ts
├── postcss.config.js
├── .prettierrc
├── eslint.config.mjs                   # Flat config ESLint
├── tsconfig.json
├── vitest.config.ts
└── playwright.config.ts
```

---

## Task 1: Project Scaffolding & Toolchain

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc`, `vitest.config.ts`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `.husky/pre-commit`

No TDD for this task (configuration files only).

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/wang/Desktop/food-tracker
npx create-next-app@latest . --typescript --tailwind --eslint --app --src=no --import-alias="@/*" --use-npm
```

Accept defaults. This creates the base Next.js + Tailwind + TypeScript + ESLint setup.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install zod
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event prettier eslint-plugin-import eslint-config-prettier husky lint-staged @typescript-eslint/eslint-plugin @typescript-eslint/parser serve
```

- [ ] **Step 3: Configure static export in next.config.ts**

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
};

export default nextConfig;
```

- [ ] **Step 4: Configure Vitest**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: [],
    include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 5: Configure Prettier**

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}
```

- [ ] **Step 6: Configure ESLint with no-explicit-any and import rules**

Update `eslint.config.mjs` to add:
- `@typescript-eslint/no-explicit-any` at error level
- Import sorting and unused imports rules
- Prettier integration

- [ ] **Step 7: Configure husky + lint-staged**

```bash
npx husky init
```

Update `.husky/pre-commit`:
```bash
npx lint-staged
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint . && prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 8: Add pre-commit typecheck**

Update `.husky/pre-commit` to also run `npx tsc --noEmit`.

- [ ] **Step 9: Verify toolchain works**

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

All should pass (or report no test files yet, which is fine).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with toolchain (ESLint, Prettier, Vitest, husky)"
```

---

## Task 2: Types & Zod Schemas

**Files:**
- Create: `lib/types.ts`, `lib/schema.ts`
- Test: `__tests__/types-schema.test.ts`

- [ ] **Step 1: Write failing test — valid MealPlan passes schema**

```typescript
// __tests__/types-schema.test.ts
import { describe, it, expect } from 'vitest';
import { mealPlanSchema } from '@/lib/schema';

describe('mealPlanSchema', () => {
  it('validates a correct MealPlan object', () => {
    const valid = {
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
        breakfast: [{ id: 'breakfast:baozi', name: '青菜包子', quantity: 21, unit: '个', displayAmount: '21 个', note: '你14个，老婆7个' }],
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

    const result = mealPlanSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/types-schema.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/schema'`

- [ ] **Step 3: Write types.ts**

Create `lib/types.ts` with all interfaces from the spec: `MealPlan`, `FixedBreakfast`, `Ingredient`, `ProteinItem`, `PersonWeighing`, `DayPlan`, `Recipe`, `ShoppingList`, `ShoppingItem`.

- [ ] **Step 4: Write schema.ts**

Create `lib/schema.ts` with zod schemas matching every type. Export `mealPlanSchema`. Note: `weightBasis` must use `z.literal('raw')` (not `z.string()`), `dayType` must use `z.enum(['虾仁日', '牛肉日'])`, and `day` must use `z.number().int().min(1).max(7)`.

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- __tests__/types-schema.test.ts
```

Expected: PASS

- [ ] **Step 6: Write failing test — invalid data rejected**

Add tests for: missing required fields, invalid dayType, negative amounts, day out of range (0 or 8).

- [ ] **Step 7: Run test to verify it fails**

Expected: FAIL (if schema doesn't have those constraints yet, add them)

- [ ] **Step 8: Fix schema to reject invalid data, verify passes**

- [ ] **Step 9: Commit**

```bash
git add lib/types.ts lib/schema.ts __tests__/types-schema.test.ts
git commit -m "feat: add TypeScript types and zod schemas for meal plan data"
```

---

## Task 3: Date Utilities

**Files:**
- Create: `lib/date-utils.ts`
- Test: `__tests__/date-utils.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/date-utils.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { getDayNumber, getDayLabel, getWeekdayName } from '@/lib/date-utils';

describe('getDayNumber', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns 1 for Monday', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-16')); // Monday
    expect(getDayNumber()).toBe(1);
    vi.useRealTimers();
  });

  it('returns 7 for Sunday', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22')); // Sunday
    expect(getDayNumber()).toBe(7);
    vi.useRealTimers();
  });

  it('returns correct day for a specific date argument', () => {
    expect(getDayNumber(new Date('2026-03-18'))).toBe(3); // Wednesday
  });
});

describe('getDayLabel', () => {
  it('returns "Day 1 · 周一" format', () => {
    expect(getDayLabel(1)).toBe('Day 1 · 周一');
  });

  it('returns "Day 7 · 周日" format', () => {
    expect(getDayLabel(7)).toBe('Day 7 · 周日');
  });
});

describe('getWeekdayName', () => {
  it('returns 周一 for day 1', () => {
    expect(getWeekdayName(1)).toBe('周一');
  });

  it('returns 周日 for day 7', () => {
    expect(getWeekdayName(7)).toBe('周日');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/date-utils.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Implement date-utils.ts**

```typescript
// lib/date-utils.ts
const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function getDayNumber(date?: Date): number {
  const d = date ?? new Date();
  const jsDay = d.getDay();
  return jsDay === 0 ? 7 : jsDay;
}

export function getDayLabel(day: number): string {
  const weekdayIndex = day === 7 ? 0 : day;
  return `Day ${day} · ${WEEKDAY_NAMES[weekdayIndex]}`;
}

export function getWeekdayName(day: number): string {
  const weekdayIndex = day === 7 ? 0 : day;
  return WEEKDAY_NAMES[weekdayIndex];
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- __tests__/date-utils.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/date-utils.ts __tests__/date-utils.test.ts
git commit -m "feat: add date utility functions with tests"
```

---

## Task 4: Markdown Parser

**Files:**
- Create: `lib/parser.ts`, `data/meal-plan.md`
- Test: `__tests__/parser.test.ts`

This is the most complex task. The parser reads the Markdown and produces a validated `MealPlan` object.

- [ ] **Step 1: Copy source Markdown into project**

```bash
cp /Users/wang/Downloads/couple_diet_plan_final_cooked_rice.md /Users/wang/Desktop/food-tracker/data/meal-plan.md
```

- [ ] **Step 2: Write failing test — parser extracts fixed breakfast**

```typescript
// __tests__/parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseMealPlan } from '@/lib/parser';
import fs from 'fs';
import path from 'path';

const markdown = fs.readFileSync(path.join(__dirname, '../data/meal-plan.md'), 'utf-8');

describe('parseMealPlan', () => {
  it('extracts fixed breakfast smoothie ingredients', () => {
    const plan = parseMealPlan(markdown);
    expect(plan.fixedBreakfast.smoothie).toHaveLength(4);
    expect(plan.fixedBreakfast.smoothie[0]).toEqual({
      name: '无糖豆浆',
      amount: 350,
      unit: 'ml',
    });
  });

  it('extracts breakfast content for each person', () => {
    const plan = parseMealPlan(markdown);
    expect(plan.fixedBreakfast.you).toContain('2个青菜包子');
    expect(plan.fixedBreakfast.wife).toContain('1个青菜包子');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm test -- __tests__/parser.test.ts
```

Expected: FAIL — `parseMealPlan` not found

- [ ] **Step 4: Implement breakfast parsing in parser.ts**

Create `lib/parser.ts` with `parseMealPlan(markdown: string): MealPlan`. Start by implementing just the breakfast section parsing. Return stub data for other sections.

- [ ] **Step 5: Run test to verify it passes**

- [ ] **Step 6: Write failing test — parser extracts 7-day week plan**

```typescript
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
```

- [ ] **Step 7: Run test to verify it fails**

- [ ] **Step 8: Implement week plan + template parsing**

Parse the "7 天执行表" and "每天实际称重清单" sections. Map day type to the correct template for each person.

- [ ] **Step 9: Run test to verify it passes**

- [ ] **Step 10: Write failing test — parser extracts shopping list**

```typescript
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
  const baozi = plan.shoppingList.breakfast.find(i => i.name === '青菜包子');
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
  expect(plan.shoppingList.pantry.every(i => i.quantity === null)).toBe(true);
});
```

- [ ] **Step 11: Implement shopping list parsing, verify passes**

- [ ] **Step 12: Write failing test — parser extracts recipes**

```typescript
it('extracts 7 recipes', () => {
  const plan = parseMealPlan(markdown);
  expect(plan.recipes).toHaveLength(7);
});

it('recipe has steps', () => {
  const plan = parseMealPlan(markdown);
  expect(plan.recipes[0].steps.length).toBeGreaterThan(0);
});
```

- [ ] **Step 13: Implement recipe parsing, verify passes**

- [ ] **Step 14: Write failing test — parser extracts meal prep tips and reminders**

```typescript
it('extracts meal prep tips', () => {
  const plan = parseMealPlan(markdown);
  expect(plan.mealPrepTips.length).toBeGreaterThan(0);
});

it('extracts execution reminders', () => {
  const plan = parseMealPlan(markdown);
  expect(plan.executionReminders.length).toBeGreaterThan(0);
  expect(plan.executionReminders.some(r => r.includes('熟重'))).toBe(true);
});
```

- [ ] **Step 15: Implement tips/reminders parsing, verify passes**

- [ ] **Step 16: Write failing test — full parse passes zod validation**

```typescript
it('full parsed result passes zod schema validation', () => {
  const plan = parseMealPlan(markdown);
  const result = mealPlanSchema.safeParse(plan);
  if (!result.success) {
    console.error(result.error.format());
  }
  expect(result.success).toBe(true);
});
```

- [ ] **Step 17: Verify all parser tests pass**

```bash
npm test -- __tests__/parser.test.ts
```

Expected: All PASS

- [ ] **Step 18: Commit**

```bash
git add data/meal-plan.md lib/parser.ts __tests__/parser.test.ts
git commit -m "feat: implement Markdown parser with full test coverage"
```

---

## Task 5: Data Access Layer

**Files:**
- Create: `lib/data.ts`
- Test: `__tests__/data.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/data.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement data.ts**

```typescript
// lib/data.ts
import { parseMealPlan } from './parser';
import { mealPlanSchema } from './schema';
import type { MealPlan, DayPlan, ShoppingList } from './types';
import fs from 'fs';
import path from 'path';

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
  const found = plan.weekPlan.find(d => d.day === day);
  if (!found) throw new Error(`Day ${day} not found`);
  return found;
}

export function getShoppingList(): ShoppingList {
  return loadMealPlan().shoppingList;
}
```

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add lib/data.ts __tests__/data.test.ts
git commit -m "feat: add data access layer with caching and validation"
```

---

## Task 6: Shopping Storage (localStorage Wrapper)

**Files:**
- Create: `lib/shopping-storage.ts`
- Test: `__tests__/shopping-storage.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/shopping-storage.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCheckedIds, toggleItem, resetChecklist, STORAGE_KEY } from '@/lib/shopping-storage';

describe('shopping-storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when nothing is checked', () => {
    expect(getCheckedIds()).toEqual([]);
  });

  it('toggleItem adds an ID', () => {
    toggleItem('breakfast:baozi');
    expect(getCheckedIds()).toEqual(['breakfast:baozi']);
  });

  it('toggleItem removes an already-checked ID', () => {
    toggleItem('breakfast:baozi');
    toggleItem('breakfast:baozi');
    expect(getCheckedIds()).toEqual([]);
  });

  it('resetChecklist clears all checked items', () => {
    toggleItem('breakfast:baozi');
    toggleItem('protein:shrimp');
    resetChecklist();
    expect(getCheckedIds()).toEqual([]);
  });

  it('gracefully handles localStorage being unavailable', () => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = () => { throw new Error('blocked'); };
    expect(getCheckedIds()).toEqual([]);
    Storage.prototype.getItem = originalGetItem;
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement shopping-storage.ts**

```typescript
// lib/shopping-storage.ts
const PLAN_HASH = 'default';
export const STORAGE_KEY = `shopping-checklist:v1:${PLAN_HASH}`;

export function getCheckedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function toggleItem(id: string): string[] {
  const current = getCheckedIds();
  const next = current.includes(id)
    ? current.filter(i => i !== id)
    : [...current, id];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable — function still works but won't persist
  }
  return next;
}

export function resetChecklist(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add lib/shopping-storage.ts __tests__/shopping-storage.test.ts
git commit -m "feat: add shopping checklist localStorage wrapper with tests"
```

---

## Task 7: Shared UI Components

**Files:**
- Create: `components/CollapsibleSection.tsx`, `components/BottomNav.tsx`, `components/WeighingCard.tsx`, `components/BreakfastSection.tsx`
- Modify: `app/globals.css`

No TDD for presentational components (configuration exception per TDD skill — UI markup without business logic). Visual verification via `npm run dev`.

- [ ] **Step 1: Set up Tailwind theme in globals.css**

Add CSS custom properties for the warm orange/brown palette:
- `--color-primary`: #e65100
- `--color-primary-light`: #ff8a65
- `--color-bg-gradient-start`: #fff3e0
- `--color-bg-gradient-end`: #fbe9e7
- `--color-you`: #fff8e1 (warm yellow card)
- `--color-wife`: #fce4ec (pink card)
- `--color-text`: #4e342e
- `--color-text-secondary`: #8d6e63
- `--color-text-muted`: #b0906f

- [ ] **Step 2: Implement CollapsibleSection.tsx**

Client component with `aria-expanded`, animated expand/collapse, 44px touch target. Props: `title: string`, `children: ReactNode`, `defaultOpen?: boolean`.

- [ ] **Step 3: Implement BottomNav.tsx**

Semantic `<nav>` with two tabs: 今日 / 采购清单. Highlights active tab. Uses `<Link>` from Next.js.

- [ ] **Step 4: Implement WeighingCard.tsx**

Props: `person: 'you' | 'wife'`, `weighing: PersonWeighing`. Displays rice (tagged 熟重), protein (tagged 生重), vegetable, oil, powder with correct bg color per person. Includes annotation: "午晚餐总量，各自分锅炒，平分两餐".

- [ ] **Step 5: Implement BreakfastSection.tsx**

Always shows smoothie ingredients. CollapsibleSection for breakfast details (you/wife).

- [ ] **Step 6: Verify all components render**

```bash
npm run dev
```

Open http://localhost:3000, visually confirm components render without errors.

- [ ] **Step 7: Run lint and typecheck**

```bash
npm run lint
npm run typecheck
```

- [ ] **Step 8: Commit**

```bash
git add components/ app/globals.css
git commit -m "feat: add shared UI components (CollapsibleSection, BottomNav, WeighingCard, BreakfastSection)"
```

---

## Task 8: Homepage — Daily Overview

**Files:**
- Create: `components/DayNavigation.tsx`, `components/DayContent.tsx`
- Modify: `app/page.tsx`, `app/layout.tsx`

- [ ] **Step 1: Implement app/layout.tsx**

Root layout with BottomNav. Sets up `<html lang="zh-CN">`, font, and the nav at the bottom.

- [ ] **Step 2: Implement DayContent.tsx**

Pure presentational component that receives a `DayPlan` and renders: menu heading, two WeighingCards (side by side on desktop, stacked on mobile), CollapsibleSection for recipe steps, CollapsibleSection for meal prep tips/reminders, BreakfastSection. Each DayContent has a `data-day={day.day}` attribute for client-side visibility toggling. All 7 instances are rendered in the DOM; the active one is shown, others are `hidden`.

- [ ] **Step 3: Implement DayNavigation.tsx (client)**

Client component (`'use client'`). Reads `?day=N` from URL (via `useSearchParams`). Defaults to `getDayNumber()` if no param. Left/right arrows update the URL via `useRouter().replace()`. Click on date text jumps back to today. Wraps around (Day 1 ← → Day 7). Shows day type badge (虾仁日/牛肉日). Also displays the concrete calendar date (e.g. "3月18日") as a reference.

**Rendering strategy:** All 7 `DayContent` blocks are rendered in the static HTML with `data-day` attributes. `DayNavigation` controls visibility by toggling `hidden` class on sibling `DayContent` elements via a shared parent client component. This keeps DayContent as pure markup while allowing client-side switching.

**Important:** `useSearchParams()` requires a `<Suspense>` boundary in static export mode. The page.tsx must wrap the client portion in `<Suspense>`.

- [ ] **Step 4: Create HomepageClient.tsx wrapper (client component)**

```typescript
// components/HomepageClient.tsx
'use client';

import { Suspense } from 'react';
import DayNavigation from './DayNavigation';
import type { MealPlan } from '@/lib/types';

function HomepageInner({ mealPlan }: { mealPlan: MealPlan }) {
  // DayNavigation reads ?day=N and controls which DayContent is visible
  // All 7 DayContent blocks are rendered; only the selected one is shown
  return <DayNavigation weekPlan={mealPlan.weekPlan} />;
}

export default function HomepageClient({ mealPlan }: { mealPlan: MealPlan }) {
  return (
    <Suspense fallback={<HomepageSkeleton />}>
      <HomepageInner mealPlan={mealPlan} />
    </Suspense>
  );
}

function HomepageSkeleton() {
  // Skeleton showing date nav placeholder and card shapes
  return (
    <div className="animate-pulse">
      <div className="h-24 bg-orange-100 rounded-lg mb-4" />
      <div className="h-48 bg-orange-50 rounded-lg" />
    </div>
  );
}
```

- [ ] **Step 5: Wire up app/page.tsx**

```typescript
// app/page.tsx
import { getMealPlan } from '@/lib/data';
import HomepageClient from '@/components/HomepageClient';
import DayContent from '@/components/DayContent';

export default function HomePage() {
  const mealPlan = getMealPlan();
  return (
    <main className="max-w-[960px] mx-auto pb-20">
      <HomepageClient mealPlan={mealPlan} />
      {mealPlan.weekPlan.map((day) => (
        <DayContent
          key={day.day}
          dayPlan={day}
          recipes={mealPlan.recipes}
          breakfast={mealPlan.fixedBreakfast}
          mealPrepTips={mealPlan.mealPrepTips}
          executionReminders={mealPlan.executionReminders}
        />
      ))}
    </main>
  );
}
```

`HomepageClient` (client) renders `DayNavigation` inside a `Suspense` boundary with skeleton fallback. All 7 `DayContent` blocks are static HTML; the client component toggles their visibility.

- [ ] **Step 5: Visual verification**

```bash
npm run dev
```

Test on http://localhost:3000:
- Today's content shows by default
- Left/right arrows navigate
- Cards display correctly
- Collapsible sections work
- Mobile responsive (resize browser)

- [ ] **Step 6: Run lint, typecheck, tests**

```bash
npm run lint && npm run typecheck && npm run test
```

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx app/layout.tsx components/DayNavigation.tsx components/DayContent.tsx
git commit -m "feat: implement homepage with daily overview, date navigation, and weighing cards"
```

---

## Task 9: Shopping List Page

**Files:**
- Create: `components/ShoppingChecklist.tsx`, `components/ShoppingCategory.tsx`, `components/ShoppingItemRow.tsx`, `app/shopping/page.tsx`

- [ ] **Step 1: Implement ShoppingItemRow.tsx**

Props: `item: ShoppingItem`, `checked: boolean`, `onToggle: (id: string) => void`. Renders checkbox, name, displayAmount, note. Strikethrough + gray when checked. 44px touch target.

- [ ] **Step 2: Implement ShoppingCategory.tsx**

Props: `title: string`, `icon: string`, `items: ShoppingItem[]`, `checkedIds: string[]`, `onToggle: (id: string) => void`. Renders category header + list of ShoppingItemRow.

- [ ] **Step 3: Implement ShoppingChecklist.tsx (client)**

Client component. Uses `useEffect` to load checked IDs from localStorage via `shopping-storage.ts`. Shows skeleton while loading. Progress bar and "已买 X / 共 Y 项". Reset button with confirmation dialog. Renders ShoppingCategory for each category.

- [ ] **Step 4: Implement app/shopping/page.tsx**

```typescript
// app/shopping/page.tsx
import { getShoppingList } from '@/lib/data';
import ShoppingChecklist from '@/components/ShoppingChecklist';

export default function ShoppingPage() {
  const shoppingList = getShoppingList();
  return (
    <main className="max-w-[960px] mx-auto pb-20">
      <ShoppingChecklist shoppingList={shoppingList} />
    </main>
  );
}
```

- [ ] **Step 5: Visual verification**

```bash
npm run dev
```

Test on http://localhost:3000/shopping:
- All categories display
- Checkboxes work and persist across refresh
- Progress updates
- Reset button shows confirmation and clears
- Skeleton shows briefly on load

- [ ] **Step 6: Run lint, typecheck, tests**

```bash
npm run lint && npm run typecheck && npm run test
```

- [ ] **Step 7: Commit**

```bash
git add app/shopping/ components/Shopping*.tsx
git commit -m "feat: implement shopping list page with checklist, progress, and reset"
```

---

## Task 10: E2E Smoke Tests

**Files:**
- Create: `e2e/smoke.spec.ts`, `playwright.config.ts`

- [ ] **Step 1: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Configure playwright.config.ts**

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run build && npx serve out -l 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:4173',
  },
});
```

- [ ] **Step 3: Write E2E smoke tests**

```typescript
// e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';

test('homepage shows today menu and weighing data', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Day')).toBeVisible();
  await expect(page.locator('text=糙米')).toBeVisible();
  await expect(page.locator('text=虾仁').or(page.locator('text=牛腿肉'))).toBeVisible();
});

test('homepage date navigation works', async ({ page }) => {
  await page.goto('/?day=1');
  await expect(page.locator('text=Day 1')).toBeVisible();
  await expect(page.locator('text=番茄虾仁')).toBeVisible();
});

test('shopping page shows checklist', async ({ page }) => {
  await page.goto('/shopping');
  await expect(page.locator('text=一周采购清单')).toBeVisible();
  await expect(page.locator('text=青菜包子')).toBeVisible();
});

test('shopping checklist toggle persists', async ({ page }) => {
  await page.goto('/shopping');
  const firstCheckbox = page.locator('input[type="checkbox"]').first();
  await firstCheckbox.check();
  await page.reload();
  await expect(firstCheckbox).toBeChecked();
});
```

- [ ] **Step 4: Run E2E tests**

```bash
npm run test:e2e
```

Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add e2e/ playwright.config.ts
git commit -m "feat: add Playwright E2E smoke tests for homepage and shopping page"
```

---

## Task 11: Build Verification & Static Export

**Files:**
- Modify: `next.config.ts` (if needed)

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Static export to `out/` directory without errors.

- [ ] **Step 2: Serve and verify locally**

```bash
npx serve out
```

Open http://localhost:3000, verify both pages work correctly.

- [ ] **Step 3: Run all tests**

```bash
npm run test
npm run test:e2e
```

All PASS.

- [ ] **Step 4: Commit if any fixes were needed**

---

## Task 12: Final Quality Pass

**This task is MANDATORY before handing off to user.**

- [ ] **Step 1: Run code simplifier**

Invoke the `simplify` skill on all changed code. Fix any issues found.

- [ ] **Step 2: Run code reviewer**

Dispatch `superpowers:code-reviewer` agent to review the full implementation against the spec. Fix any issues raised.

- [ ] **Step 3: Run all tests one final time**

```bash
npm run lint && npm run typecheck && npm run test && npm run test:e2e
```

All must pass.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final quality pass — simplify + review + all tests green"
```

- [ ] **Step 5: Hand off to user for local verification**

Tell the user:
```
npm run dev    # 开发模式预览
npm run build  # 静态构建
npx serve out  # 预览构建产物
```
