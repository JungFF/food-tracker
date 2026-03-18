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

## 代码质量

- **Pre-commit hook**（通过 husky + lint-staged）：
  - `eslint` — 代码风格检查
  - `tsc --noEmit` — 类型检查
- **ESLint**: 启用 `@typescript-eslint/no-explicit-any`（error 级别），禁止使用 `any`
- 写第一行业务代码之前，先配好 hook 和 lint 规则

## 数据架构

### 数据源

原始数据存放在 `data/meal-plan.md`，构建时由 `lib/parser.ts` 解析为结构化 JSON。

### 核心类型

```typescript
interface MealPlan {
  fixedBreakfast: FixedBreakfast
  templates: Templates
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

interface PersonWeighing {
  rice: number                    // 糙米熟重 g（称熟饭重量）
  protein: string                 // 主蛋白描述（如 "虾仁 310.9g"，称生重）
  vegetable: number               // 蔬菜 g
  oil: number                     // 油 g
  powder: number                  // 蛋白粉 g
}

// 共 4 套模板，非对称分布：
// - 虾仁日：你和老婆都用模板 A，但克数不同（按各自热量目标计算）
// - 牛肉日：你用模板 B，老婆用模板 C（现实版，蛋白粉更少、牛肉更多）
// - 不存在 B_wife 或 C_you
interface Templates {
  A_you: PersonWeighing           // 虾仁日 - 你（~2000kcal）
  A_wife: PersonWeighing          // 虾仁日 - 老婆（~1000kcal）
  B_you: PersonWeighing           // 牛肉日 - 你（~2000kcal）
  C_wife: PersonWeighing          // 牛肉日 - 老婆（~1000kcal，现实版）
}

interface DayPlan {
  day: number                     // 1-7
  dayType: string                 // "虾仁日" | "牛肉日"
  menu: string                    // 如 "番茄虾仁 + 上海青 + 糙米"
  youTemplate: string             // 模板 ID
  wifeTemplate: string            // 模板 ID
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
  vegetable: ShoppingItem[]       // 按具体蔬菜逐项列出，非仅总量
  oil: ShoppingItem[]             // 食用油（有具体克数）
  condiment: ShoppingItem[]       // 调味料（生抽/盐/黑胡椒/蒜/姜，合并为一项）
}

interface ShoppingItem {
  name: string
  amount: string                  // 如 "21 个"、"1658.4 g"、"适量"
  note?: string                   // 如 "建议买 3L"
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

## 页面设计

### 路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 每日概览 | 今日菜单 + 称重数据 |
| `/shopping` | 采购清单 | 一周购物清单 + 勾选功能 |

### 首页 `/` — 每日概览

从上到下的内容区块：

1. **日期导航栏**
   - 居中显示：Day N · 周X + 具体日期
   - 左右箭头切换日期
   - 日类型标签（虾仁日/牛肉日），带颜色标记
   - 点击日期文字可跳回今天

2. **今日菜单**
   - 显示当天菜名，如"番茄虾仁 + 上海青 + 糙米"

3. **称重清单**
   - 两人并排显示（桌面端），上下排列（手机端）
   - 每人一张卡片，不同背景色区分（你=暖黄，老婆=粉色）
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

### 采购清单 `/shopping`

从上到下的内容区块：

1. **顶部**
   - 标题"一周采购清单"
   - 进度显示"已买 X / 共 Y 项" + 进度条
   - 重置按钮（清空所有勾选）

2. **分类列表**
   - 按类别分组：早餐、主食、蛋白质、蔬菜、食用油、调味料
   - 蔬菜按具体品种逐项列出（油麦菜、上海青等），不只显示总量
   - 食用油单独一项（有具体克数 102.6g），与调味料分开
   - 调味料（生抽/盐/黑胡椒/蒜/姜）合并为一项（都是"适量"）
   - 每项显示：勾选框 + 食材名 + 数量 + 备注（小字）
   - 勾选后：文字划线变灰

3. **底部导航栏**（同首页）

### 勾选状态持久化

- 存储在 localStorage
- key: `shopping-checklist`
- value: 已勾选食材 name 的数组
- 重置按钮清空该 key
- 注意：采购清单组件需用 `'use client'` + `useEffect` 读取 localStorage，避免 SSG 水合不匹配

## 响应式设计

- **移动端优先**（< 768px）：称重卡片上下排列，字体适配小屏
- **桌面端**（>= 768px）：称重卡片并排，整体居中最大宽度 640px

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
│   ├── parser.ts                 # Markdown → JSON 解析器
│   ├── types.ts                  # TypeScript 类型定义
│   └── meal-data.ts              # 导出解析后的数据
├── app/
│   ├── layout.tsx                # 全局布局（底部导航）
│   ├── page.tsx                  # 首页（每日概览）
│   └── shopping/
│       └── page.tsx              # 采购清单页面
├── components/
│   ├── DayNavigation.tsx         # 日期导航组件
│   ├── WeighingCard.tsx          # 称重卡片组件
│   ├── CollapsibleSection.tsx    # 折叠区块组件
│   ├── ShoppingItem.tsx          # 采购清单项组件
│   └── BottomNav.tsx             # 底部导航组件
├── package.json
├── next.config.js                # 静态导出配置
└── tsconfig.json
```

## 未来扩展点

- 在线编辑食谱：加 API routes + 数据库
- 多食谱支持：支持多个 Markdown 文件切换
- PWA：离线访问，添加到手机主屏幕
