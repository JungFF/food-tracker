# 夫妻减脂食谱追踪网站 — 设计文档

## 概述

将 Markdown 格式的夫妻减脂食谱转化为一个响应式网站，方便在手机和电脑上快速查看每日菜单、称重数据和每周采购清单。

## 核心需求

- 打开即看到今天要做什么菜、称什么食材、称多少克
- 两人数据同时显示，无需切换
- 独立采购清单页面，可勾选已买食材
- 部署上线，手机电脑都能访问
- 先做纯展示，架构留余地给未来编辑功能

## 技术选型

- **框架**: Next.js（静态导出）+ React + TypeScript
- **样式**: Tailwind CSS，暖橙/棕色系配色，食物主题设计感
- **部署**: Vercel（免费、自动 HTTPS、push 即部署）
- **数据源**: Markdown 文件，构建时解析为 JSON
- **状态存储**: localStorage（采购清单勾选状态）
- **校验**: zod（构建时校验 Markdown 解析结果）

### 客户端渲染策略

页面壳体和静态内容（数据、布局）保持为服务端/静态组件，只把需要客户端状态的部分抽成小型客户端子组件：
- **客户端子组件**: 日期选择器（`DayNavigation`）、采购清单勾选状态（`ShoppingChecklist`）
- **静态组件**: 称重卡片、做法步骤、早餐区块、底部导航等（数据在构建时确定）
- 首页通过 `?day=N` 参数决定显示哪天，所有 7 天的数据都在静态 HTML 中可用
- 客户端子组件在 `useEffect` 中读取当前日期和 localStorage
- 数据本身是静态的（构建时从 Markdown 解析），只有"默认选中哪天"和"勾选状态"是客户端状态

### Phase 1 vs Phase 2 边界

- **Phase 1（当前）**: 纯静态站，`output: 'export'`，数据硬编码在构建产物中，无后端
- **Phase 2（未来编辑功能）**: 需切换到 SSR/Serverless 部署模式，加 API routes + 数据库。为降低迁移成本，Phase 1 的页面通过统一的 `getData()` 函数访问数据，不直接 import 解析后的 JSON

## 代码质量

- **Pre-commit hook**（通过 husky + lint-staged）：
  - `eslint` — 代码风格检查
  - `tsc --noEmit` — 类型检查
- **ESLint**: 启用 `@typescript-eslint/no-explicit-any`（error 级别），禁止使用 `any`
- **Prettier**: 代码格式化，集成到 lint-staged
- **Import 规则**: eslint-plugin-import 排序和 unused imports 检查
- 写第一行业务代码之前，先配好 hook 和 lint 规则

### 环境基线

- **Node**: >= 20 LTS
- **包管理器**: npm
- **NPM scripts**: `dev`（开发）、`build`（构建）、`lint`（ESLint + Prettier check）、`typecheck`（tsc --noEmit）、`test`（单元测试）、`test:e2e`（Playwright）

### 测试策略

- **parser 单元测试**: 验证 Markdown 解析结果符合 zod schema，覆盖正常和异常输入
- **日期映射测试**: 验证 `getTodayDayNumber()` 和日期导航逻辑的边界情况（周日、跨周）
- **采购清单状态测试**: 验证 localStorage 读写、重置、降级行为
- **E2E smoke test**: 至少 1 条首页 + 1 条采购清单页的端到端测试（Playwright）

## 数据架构

### 数据源

原始数据存放在 `data/meal-plan.md`，构建时由 `lib/parser.ts` 解析为结构化 JSON，解析结果经 zod schema 校验。校验失败时构建报错并指出具体问题。

### 核心类型

```typescript
interface MealPlan {
  fixedBreakfast: FixedBreakfast
  weekPlan: DayPlan[]
  shoppingList: ShoppingList
  recipes: Recipe[]
  mealPrepTips: string[]          // 备餐建议（如何分装、冷冻、解冻等）
  executionReminders: string[]    // 执行提醒（如"糙米按熟重"、"虾仁按生重"等）
}

interface FixedBreakfast {
  smoothie: Ingredient[]          // 奶昔配方（两人平分）
  you: string                     // 你的早餐内容描述
  wife: string                    // 老婆的早餐内容描述
}

interface Ingredient {
  name: string
  amount: number
  unit: string
}

interface ProteinItem {
  name: string                    // 如 "虾仁"、"牛腿肉"
  amount: number                  // 克数
  weightBasis: 'raw'              // 始终按生重称
}

interface PersonWeighing {
  rice: number                    // 糙米熟重 g（称熟饭重量）
  protein: ProteinItem            // 主蛋白（结构化，称生重）
  vegetable: number               // 蔬菜 g
  oil: number                     // 油 g
  powder: number                  // 蛋白粉 g
}

// DayPlan 直接内联两人的称重数据，模板复用留在解析层
// 解析器负责根据 dayType 查找对应模板并填充
interface DayPlan {
  day: number                     // 1-7
  dayType: '虾仁日' | '牛肉日'
  menu: string                    // 如 "番茄虾仁 + 上海青 + 糙米"
  you: PersonWeighing             // 你的称重数据
  wife: PersonWeighing            // 老婆的称重数据
}

interface Recipe {
  day: number
  title: string
  steps: string[]
}

interface ShoppingList {
  breakfast: ShoppingItem[]
  staple: ShoppingItem[]          // 主食（糙米）
  protein: ShoppingItem[]
  vegetable: ShoppingItem[]       // 按具体蔬菜逐项列出
  oil: ShoppingItem[]             // 食用油（有具体克数）
  pantry: ShoppingItem[]          // 家中常备调味料（生抽/盐/黑胡椒/蒜/姜）
}

interface ShoppingItem {
  id: string                      // 稳定 ID（category:name hash），用于 localStorage
  name: string
  quantity: number | null          // 数量（null 表示"适量"）
  unit: string | null              // 单位（null 表示无单位）
  displayAmount: string            // 展示用字符串，如 "21 个"、"适量"
  note?: string                    // 如 "建议买 3L"
}
```

### 日期映射逻辑

周一 = Day 1，周二 = Day 2，……周日 = Day 7。永久固定，按 7 天无限循环。

```typescript
function getTodayDayNumber(): number {
  const jsDay = new Date().getDay()   // 0=周日, 1=周一...
  return jsDay === 0 ? 7 : jsDay      // 转换为 1=周一, 7=周日
}
```

### 数据访问层

页面不直接 import 解析后的 JSON，而是通过统一的 `getData()` 函数获取数据：

```typescript
// lib/data.ts — Phase 1 直接读取静态数据，Phase 2 可改为 API 调用
export function getMealPlan(): MealPlan { ... }
export function getDayPlan(day: number): DayPlan { ... }
export function getShoppingList(): ShoppingList { ... }
```

## 页面设计

### 路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 每日概览 | 默认显示今天，支持 `?day=N` 查询参数 |
| `/shopping` | 采购清单 | 一周购物清单 + 勾选功能 |

### 首页 `/` — 每日概览

URL 支持 `?day=N`（N=1-7）查询参数，默认为今天。由于食谱是固定的 7 天循环模板，`?day=N` 表达的是"周几的模板"而非某个具体日历日期，因此分享链接始终指向同一个模板，这是预期行为。页面上显示的"具体日期"仅作为当前日期参考，不编码进 URL。

从上到下的内容区块：

1. **日期导航栏**
   - 居中显示：Day N · 周X + 具体日期
   - 左右箭头切换日期（更新 URL 查询参数）
   - 日类型标签（虾仁日/牛肉日），带颜色标记
   - 点击日期文字可跳回今天

2. **今日菜单**
   - 显示当天菜名，如"番茄虾仁 + 上海青 + 糙米"

3. **称重清单**
   - 两人并排显示（桌面端），上下排列（手机端）
   - 每人一张卡片，不同背景色区分（你=暖黄，老婆=粉色）+ 文字标签（不只靠颜色区分）
   - 每张卡片列出：糙米(熟重)、主蛋白(生重)、蔬菜、油、蛋白粉及对应克数
   - 糙米标注"熟重"，虾仁/牛腿肉标注"生重"（重要：避免称错）
   - 标注"午晚餐总量，各自分锅炒，平分两餐"

4. **做法步骤**（折叠，默认收起）
   - 展开后显示当天菜品的简易做法步骤

5. **备餐与提醒**（折叠，默认收起）
   - 展开后显示备餐建议（如何分装糙米、冷冻虾仁、处理牛肉等）
   - 以及执行提醒（糙米按熟重、虾仁牛肉按生重、蛋白粉按克称等）

6. **早餐区块**
   - 奶昔配方**始终显示**：豆浆 350ml、黄瓜 150g、菠菜 50g、橙子 130g
   - 早餐详情**折叠，默认收起**：展开后显示你和老婆各自的早餐内容

7. **底部导航栏**
   - 两个 tab：今日 / 采购清单
   - 使用语义化 `<nav>` 元素

### 采购清单 `/shopping`

从上到下的内容区块：

1. **顶部**
   - 标题"一周采购清单"
   - 进度显示"已买 X / 共 Y 项" + 进度条
   - 重置按钮（点击后弹出确认，再清空勾选）

2. **分类列表**
   - 按类别分组：早餐、主食、蛋白质、蔬菜、食用油、家中常备
   - 蔬菜按具体品种逐项列出（油麦菜、上海青等），不只显示总量
   - 食用油单独一项（有具体克数 102.6g），与调味料分开
   - "家中常备"分组：调味料逐项列出（生抽/盐/黑胡椒/蒜/姜），语义上表示"检查库存"而非"精确采购"
   - 每项显示：勾选框 + 食材名 + 数量 + 备注（小字）
   - 勾选后：文字划线变灰

3. **底部导航栏**（同首页）

### UI 状态

- **首页 skeleton**: 挂载前显示日期导航和卡片的占位骨架，避免空白闪烁
- **采购清单 hydration**: 进度数字和勾选状态在 localStorage 读取完成前显示 skeleton 占位（不渲染错误的默认值），`useEffect` 后恢复真实状态
- **localStorage 不可用降级**: 功能正常但不持久化，刷新后重置（不报错）
- **重置确认**: 点击重置按钮后弹出确认对话框，防止误操作

### 勾选状态持久化

- 存储在 localStorage
- key: `shopping-checklist:v1:{planHash}`（Phase 1 planHash 为固定值，Phase 2 多食谱时按计划区分）
- value: 已勾选食材 ID（ShoppingItem.id）的数组
- 重置按钮清空该 key
- 使用稳定 ID 而非食材名，避免改版或重名导致状态错位

## 响应式设计

- **移动端优先**（< 768px）：称重卡片上下排列，字体适配小屏
- **桌面端**（>= 768px）：称重卡片并排，整体居中最大宽度 960px

## 可访问性

- 按钮和 tab 使用语义化 HTML 元素（`<button>`, `<nav>`）
- 折叠区块使用 `aria-expanded` 属性
- 不只靠颜色区分人物，同时有文字标签
- 文本/背景满足 WCAG AA 对比度
- 触控目标至少 44px

## 视觉风格

- **配色**: 暖橙/棕色系（主色 #e65100, 背景渐变 #fff3e0 → #fbe9e7）
- **不使用绿色**
- **卡片风格**: 圆角卡片，轻阴影
- **食物主题**: emoji 图标辅助分类（🍚🦐🥬🫒💪🥤🍳）
- **字体**: 系统默认字体栈

## 项目结构

```
food-tracker/
├── data/
│   └── meal-plan.md              # 原始 Markdown 食谱
├── lib/
│   ├── parser.ts                 # Markdown → JSON 解析器（构建时运行）
│   ├── schema.ts                 # zod schema 定义 + 校验
│   ├── types.ts                  # TypeScript 类型定义
│   └── data.ts                   # 数据访问层（统一的 getData 函数）
├── app/
│   ├── layout.tsx                # 全局布局（底部导航）
│   ├── globals.css               # Tailwind 全局样式入口
│   ├── page.tsx                  # 首页（每日概览）
│   └── shopping/
│       └── page.tsx              # 采购清单页面
├── components/
│   ├── DayNavigation.tsx         # 日期导航组件
│   ├── WeighingCard.tsx          # 称重卡片组件
│   ├── CollapsibleSection.tsx    # 折叠区块组件
│   ├── ShoppingItem.tsx          # 采购清单项组件
│   └── BottomNav.tsx             # 底部导航组件
├── __tests__/                    # 测试文件
│   ├── parser.test.ts            # 解析器测试
│   ├── date-utils.test.ts        # 日期逻辑测试
│   └── shopping-state.test.ts    # 采购清单状态测试
├── e2e/                          # Playwright E2E 测试
│   └── smoke.spec.ts
├── package.json
├── next.config.js                # 静态导出配置
├── tailwind.config.ts
├── .prettierrc
├── .eslintrc.js
└── tsconfig.json
```

## 未来扩展点

- **在线编辑食谱**: 切换到 SSR/Serverless 部署，加 API routes + 数据库，`lib/data.ts` 改为调用 API
- **多食谱支持**: 支持多个 Markdown 文件切换
- **PWA**: 离线访问，添加到手机主屏幕
