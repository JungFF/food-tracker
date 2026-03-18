# Food Tracker

A responsive meal-plan tracker for couples on a structured diet. Displays daily weighing data, recipes, and a weekly shopping checklist — all parsed from a single Markdown file.

Built as a static site with Next.js, deployable to Vercel with zero backend cost.

## Features

- **Daily Overview** — Open the app and immediately see today's menu, weighing data for both people, and cooking instructions
- **Date Navigation** — Browse any day of the week with `?day=N` URL support
- **Shopping Checklist** — Weekly grocery list with checkboxes, progress tracking, and a reset button. State persists in localStorage
- **Responsive** — Mobile-first design, works on phones (kitchen use) and desktops
- **Offline Data** — All meal data is parsed from Markdown at build time, no API calls needed

## Tech Stack

- **Next.js** (static export) + **React** + **TypeScript**
- **Tailwind CSS** v4 — warm orange/brown color theme
- **Zod** — build-time schema validation for parsed data
- **Vitest** — 43 unit tests
- **Playwright** — 4 E2E smoke tests
- **Husky + lint-staged** — pre-commit hooks (ESLint + TypeScript check)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build static site
npm run build

# Preview build
npx serve out
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
food-tracker/
├── data/meal-plan.md          # Source meal plan (Markdown)
├── lib/
│   ├── types.ts               # TypeScript interfaces
│   ├── schema.ts              # Zod validation schemas
│   ├── parser.ts              # Markdown → structured data
│   ├── data.ts                # Data access layer
│   ├── date-utils.ts          # Day number / label utilities
│   └── shopping-storage.ts    # localStorage wrapper
├── components/                # React components
├── app/                       # Next.js App Router pages
├── __tests__/                 # Unit tests (Vitest)
└── e2e/                       # E2E tests (Playwright)
```

## How It Works

1. A Markdown file (`data/meal-plan.md`) contains the full weekly meal plan: breakfast, lunch/dinner templates, weighing data, shopping lists, and recipes
2. At build time, `lib/parser.ts` parses the Markdown into a typed `MealPlan` object, validated by Zod schemas
3. The static site renders all 7 days into HTML; a client-side component toggles which day is visible based on the current weekday
4. The shopping checklist uses `localStorage` for check/uncheck persistence

## Customization

To use your own meal plan, replace `data/meal-plan.md` with your own Markdown file following the same structure. The parser expects specific Chinese headings and table formats — see the existing file as a reference.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build static site to `out/` |
| `npm run lint` | Run ESLint + Prettier check |
| `npm run typecheck` | Run TypeScript type check |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |

## License

MIT
