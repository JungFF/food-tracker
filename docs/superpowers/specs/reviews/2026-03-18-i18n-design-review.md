# Plan Review: i18n Design Spec

**Plan File**: docs/superpowers/specs/2026-03-18-i18n-design.md
**Reviewer**: Codex

---

## Round 1 — 2026-03-18

### Overall Assessment
The spec identifies the main i18n surfaces correctly, but it materially understates how tightly the current parser and rendering flow are coupled to Chinese source content and server-rendered HTML. As written, it would likely work only after more parser, storage, testing, and hydration changes than the document currently acknowledges.
**Rating**: 4/10

### Issues
#### Issue 1 (Critical): The "parser unchanged" claim is inaccurate because parsing depends on far more than top-level Chinese headings
**Location**: Key Decisions table "English MD headings" and Data Layer "No changes to `lib/parser.ts`" (lines 12-13, 47-50, 173)
The spec says English markdown can keep Chinese headings and therefore avoid parser changes, but the current parser also relies on Chinese subsection labels and content markers such as `奶昔总配方`, `你`, `你老婆`, `一周只买一次菜：购物清单`, `早餐部分`, `主食部分`, `蛋白质部分`, `午晚餐蔬菜部分`, `建议买菜分配`, `食用油与调味料`, and `适量` in `lib/parser.ts`. That means "English content" is still constrained by multiple Chinese parser anchors that the plan does not enumerate.
**Suggestion**: Revise the plan to either 1. list every invariant Chinese anchor that must remain in both files, or 2. explicitly refactor the parser to a locale-neutral format so English data can actually be authored in English without hidden constraints.

#### Issue 2 (Critical): English breakfast content will be mangled by the current parser
**Location**: Data Layer "English meal data" and "No changes to `lib/parser.ts`" (lines 12, 23-26, 47-50)
`parseFixedBreakfast()` strips all whitespace from the breakfast text via `content.replace(/\s+/g, '')` in `lib/parser.ts`. That is tolerable for Chinese phrases but will collapse normal English text like `2 veggie buns + soy milk` into unreadable output.
**Suggestion**: Add a required parser change here. Preserve internal spaces for breakfast strings, or better, change breakfast table cells to structured list items so formatting is locale-safe.

#### Issue 3 (High): "Pure client-side" locale initialization creates a guaranteed Chinese-first flash for returning English users
**Location**: Key Decisions "Language switching" and i18n Infrastructure / SSR hydration considerations (lines 16, 88-91, 98-101)
The provider design always renders Chinese first and then flips to English after `useEffect`. That avoids a React hydration mismatch, but it still causes visible content flash, title flash, and `lang` correction after paint for every returning English user. In this app, that means the entire meal plan, nav labels, and shopping UI briefly render in the wrong language.
**Suggestion**: Add an explicit pre-hydration strategy. For example, inject a tiny inline script in `layout.tsx` that reads `localStorage` and sets `document.documentElement.lang` plus an initial locale marker before React hydrates, then initialize the provider from that marker.

#### Issue 4 (High): Moving all day rendering into `HomepageClient` discards the current static-HTML advantage without weighing the tradeoff
**Location**: Server → Client data flow and Page restructuring (lines 52-78, 162)
The current home page server-renders all seven day panels in `app/page.tsx` and only uses the client for day switching in `components/HomepageClient.tsx` and `components/DayNavigation.tsx`. The spec replaces that with client-side rendering of active content, but it does not acknowledge the cost: more hydration payload, weaker no-JS/static fallback, and a larger client rendering boundary.
**Suggestion**: Add a design comparison and justify why this tradeoff is acceptable. A stronger option is to keep server-rendered content where possible and limit the client boundary to locale state plus day selection, instead of moving the full content tree into the client by default.

#### Issue 5 (High): Passing two full `MealPlan` objects to the client is an avoidable payload increase
**Location**: Server → Client data flow and Data-switching in client components (lines 54-64, 160-163)
The spec proposes serializing both full locale datasets into the home page and shopping page props. For the home page that means shipping duplicated week plans, recipes, breakfast data, tips, and reminders to the browser up front even though only one locale is shown at a time. This is especially notable because the current architecture keeps parsing and data loading server-side in `lib/data.ts`.
**Suggestion**: Narrow the payload. Either pass only the page-specific slices needed by each route, lazy-load the alternate locale on toggle, or prebuild locale JSON modules and import only what each page uses.

#### Issue 6 (High): Index-based shopping IDs are brittle and the storage migration impact is not addressed
**Location**: Shopping item ID stability and "What is NOT changing" (lines 43-50, 171-176)
The required switch to index-based IDs is described as a "small parser change," but it has two design problems. First, reordering or inserting rows in markdown will silently change IDs and detach existing checklist state from the intended item. Second, the spec says `lib/shopping-storage.ts` is unchanged, even though the persisted value semantics are changing and the current key is a fixed `shopping-checklist:v1:default`.
**Suggestion**: Replace "index-based IDs" with explicit stable source IDs, or at minimum derive IDs from a locale-independent canonical key. The plan should also require a storage key version bump or plan hash so old saved state does not ambiguously carry across the ID scheme change.

#### Issue 7 (High): The plan misses locale-dependent parsing of pantry quantities
**Location**: Data Layer "English meal data" and "No changes to `lib/parser.ts`" (lines 23-26, 47-50)
The parser currently treats `适量` as a special sentinel for pantry items and null quantities in `lib/parser.ts`. If the English markdown uses `to taste`, `as needed`, or similar, the oil/pantry split and structured quantity parsing both stop matching the current behavior.
**Suggestion**: Document this as another required parser change. Either standardize a locale-neutral sentinel token in the markdown source or teach the parser to accept locale-specific pantry markers.

#### Issue 8 (Medium): `Locale` is specified in a client context module but also needed by server-only data code
**Location**: Changes to `lib/data.ts` and New file `lib/i18n.tsx` (lines 28-41, 82-96)
The plan introduces `Locale` inside `lib/i18n.tsx`, then reuses it in server-side APIs like `getMealPlan(locale: Locale)` and `getShoppingList(locale: Locale)`. That creates an awkward boundary because `lib/data.ts` is server-only and should not depend on a client-context module for a core domain type.
**Suggestion**: Move `Locale` into a shared, framework-agnostic module such as `lib/locale.ts` or `lib/types.ts`, and keep `lib/i18n.tsx` limited to provider/hooks.

#### Issue 9 (Medium): The translation dictionary design is too stringly typed for a TypeScript codebase with strict quality gates
**Location**: New file `lib/translations.ts` (lines 103-117)
A flat `Record<string, { zh: string; en: string }>` makes missing keys and typos easy to introduce and hard to catch at compile time. That is a poor fit for a repository that already leans on typed schemas and lint/type gates from `CLAUDE.md`.
**Suggestion**: Use typed locale dictionaries instead, for example `const translations = { ... } as const` with `type TranslationKey = keyof typeof translations`, or separate `zh` and `en` objects checked for key parity in tests.

#### Issue 10 (Medium): Metadata handling is incomplete for an English locale
**Location**: SSR hydration considerations and Routing (lines 17, 98-101)
Updating only `document.title` leaves the static `description`, Open Graph data, and share previews Chinese-only because `app/layout.tsx` exports static metadata. With no locale routes, the English experience is effectively client-only and not representable in shareable HTML metadata.
**Suggestion**: Either explicitly scope SEO/share metadata out of this phase, or change the design to route-based locales if English metadata/shareability matters. The current plan sits in the middle and will surprise stakeholders.

#### Issue 11 (Medium): The spec omits the required test changes despite broad signature and rendering changes
**Location**: Overall spec; especially `lib/data.ts`, page restructuring, and date-utils sections (lines 28-41, 66-78, 165-169)
The plan changes server APIs, parser behavior, rendering boundaries, and visible UI strings, but it includes no test plan. Existing tests are tightly coupled to the current API and Chinese DOM, for example `__tests__/data.test.ts`, `__tests__/date-utils.test.ts`, and `e2e/smoke.spec.ts`.
**Suggestion**: Add an explicit verification section covering dual-locale parser tests, `lib/data.ts` locale-aware caching tests, locale persistence tests, and updated Playwright smoke tests for both home and shopping flows.

#### Issue 12 (Medium): The plan overlooks current UI logic that infers semantics from localized content
**Location**: Component Changes table and "What is NOT changing" (lines 144-151, 171-179)
The spec focuses on replacing hardcoded Chinese strings, but current UI behavior also depends on content values. `WeighingCard` chooses the emoji by checking whether the protein name contains `虾` in `components/WeighingCard.tsx`. If English data contains `shrimp` or `beef`, this behavior breaks even if the visible labels are translated correctly.
**Suggestion**: Add a small data-model or view-model change for protein kind, or derive the badge/icon from `dayType` rather than from localized protein names.

#### Issue 13 (Low): The fixed top-right language toggle needs placement and safe-area rules, not just visual direction
**Location**: Language Toggle UI (lines 119-126)
The spec defines the toggle visually but not behaviorally. On mobile, a fixed top-right control can overlap the navigation card, browser UI, or safe-area inset, especially because the current page content starts near the top of the viewport.
**Suggestion**: Add placement constraints: safe-area padding, z-index, minimum touch size, and an interaction rule for how the toggle coexists with the existing header/navigation area on small screens.

### Positive Aspects
- The spec correctly identifies shopping checklist ID stability as a real cross-locale state problem instead of treating it as a pure UI translation task.
- Keeping route structure unchanged is a reasonable product simplification for a small internal app, provided the SEO/share tradeoff is made explicit.
- The component inventory is concrete enough that implementation scope is understandable once the architectural gaps above are fixed.

### Summary
The top three issues are the inaccurate "parser unchanged" assumption, the Chinese-first flash caused by client-only locale initialization, and the unnecessary move of core page rendering into a large client boundary. Those three choices drive most of the spec's downstream feasibility, UX, and maintainability risks.
**Consensus Status**: NEEDS_REVISION
