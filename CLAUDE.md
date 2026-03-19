# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Static export to out/
npm run lint             # ESLint + Prettier check
npm run lint:fix         # Auto-fix lint issues
npm run typecheck        # TypeScript type check (tsc --noEmit)
npm run test             # Run all unit tests (Vitest)
npm run test:watch       # Vitest in watch mode
npx vitest run __tests__/parser.test.ts  # Run a single test file
npm run test:e2e         # Playwright E2E (builds first, serves on :4173)
```

Pre-commit hook runs `lint-staged` (ESLint + Prettier on staged files) and `tsc --noEmit`.

## Architecture

This is a **static Next.js app** (App Router, `output: 'export'`) that displays a weekly couples meal plan parsed from Markdown files. Supports Chinese and English via a client-side language toggle.

```
food-tracker/
├── app/
│   ├── layout.tsx              # Root layout + LanguageProvider + pre-hydration script
│   ├── globals.css             # Tailwind v4 + theme
│   ├── page.tsx                # / — loads both locale datasets, passes to HomepageClient
│   └── shopping/page.tsx       # /shopping — loads both locale datasets
├── components/
│   ├── Providers.tsx           # Client wrapper: LanguageProvider + LanguageToggle
│   ├── LanguageToggle.tsx      # Top-right "中/EN" toggle button
│   ├── HomepageClient.tsx      # Client-side day switching + locale-aware rendering
│   ├── DayNavigation.tsx       # Day 1–7 navigation bar
│   ├── DayContent.tsx          # Single day's meal display
│   ├── BreakfastSection.tsx    # Fixed breakfast card
│   ├── WeighingCard.tsx        # Per-person weighing data (dayType prop for protein emoji)
│   ├── CollapsibleSection.tsx  # Collapsible wrapper (no i18n, receives translated props)
│   ├── ShoppingChecklist.tsx   # Shopping page client root
│   ├── ShoppingCategory.tsx    # Category group in checklist
│   ├── ShoppingItemRow.tsx     # Single checklist item
│   ├── BottomNav.tsx           # Bottom tab navigation
│   └── WKWebViewScrollFix.tsx  # iOS WebView scroll patch
├── lib/
│   ├── types.ts                # TypeScript interfaces + Locale type
│   ├── schema.ts               # Zod validation schemas
│   ├── parser.ts               # Markdown → MealPlan parser
│   ├── data.ts                 # Locale-aware cached data accessor (server-only)
│   ├── date-utils.ts           # Day number / label helpers (locale-aware)
│   ├── i18n.tsx                # LanguageProvider, useLocale, useT, useToggleLocale
│   ├── translations.ts         # Typed translation dictionary (~47 keys, as const)
│   ├── shopping-storage.ts     # localStorage wrapper (v2 key, index-based IDs)
│   └── wkwebview-scroll-fix.ts # Scroll fix logic
├── data/
│   ├── meal-plan.md            # Source Markdown (Chinese)
│   └── meal-plan.en.md         # Source Markdown (English, Chinese parser anchors preserved)
├── __tests__/                  # Unit tests (Vitest, jsdom)
└── e2e/                        # E2E tests (Playwright)
```

### Data pipeline

`data/meal-plan.md` (or `.en.md`) → `lib/parser.ts` (regex-based Markdown parser) → `lib/schema.ts` (Zod validation) → `lib/data.ts` (per-locale cached accessor, server-side only)

The parser expects specific Chinese section headings as anchors (固定早餐, 7 天执行表, 每天实际称重清单, etc.) — these are preserved in the English Markdown file too. All data types are in `lib/types.ts`.

### i18n system

Custom lightweight i18n (no library). Two layers:

1. **UI strings**: `lib/translations.ts` — typed `as const` dictionary with `TranslationKey`. Components use `useT()` hook → `t('key.name')`. Compile-time key safety.
2. **Meal plan data**: Two separate Markdown files. Both loaded at build time and passed as dual props (`mealPlanZh`/`mealPlanEn`) to client components. `useLocale()` selects which to render.

**Locale bootstrap**: Pre-hydration `<script>` in `layout.tsx` reads `localStorage('locale')` and sets `data-locale` attribute on `<html>` before React hydrates. `LanguageProvider` reads this attribute synchronously for initial state — no flash.

**English Markdown rules**: `data/meal-plan.en.md` must keep all Chinese parser anchors (section headings, subsection labels, person identifiers `你`/`你老婆`, day types `虾仁日`/`牛肉日`, sentinel `适量`). Only content (ingredient names, steps, descriptions) is in English.

### Pages

- `/` — Daily meal view with day navigation (`?day=N`). Server component loads both locale datasets; `HomepageClient` handles day switching and locale-aware rendering.
- `/shopping` — Weekly shopping checklist. Check state persists in `localStorage` via `lib/shopping-storage.ts`. Index-based item IDs (`category:index`) for cross-locale stability.

### Key patterns

- **Tailwind CSS v4** with warm orange/brown color palette (no green — design preference).
- `@` path alias maps to project root.
- Import ordering enforced: builtin → external → internal → parent → sibling → index, with blank lines between groups.
- `@typescript-eslint/no-explicit-any` is set to `error`.
- `WKWebViewScrollFix` component handles iOS WebView scroll quirks.
- `WeighingCard` derives protein emoji from `dayType` prop, not from protein name string.
