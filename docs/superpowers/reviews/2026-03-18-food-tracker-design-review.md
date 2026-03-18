# Plan Review: 夫妻减脂食谱追踪网站

**Plan File**: docs/superpowers/specs/2026-03-18-food-tracker-design.md
**Reviewer**: Codex

---

## Round 1 — 2026-03-18

### Overall Assessment
这份方案把用户目标、页面信息架构和基础数据类型描述清楚了，适合快速启动一个原型。但从工程设计角度看，当前方案对"静态导出 + 今日内容 + 未来可编辑"的组合风险判断不足，且数据建模过于偏展示层，后续扩展、校验和兼容性会比较脆弱。

**Rating**: 6/10

### Issues
#### Issue 1 (Critical): 静态导出与"打开即看到今天"需求存在架构冲突
**Location**: 技术选型；日期映射逻辑；首页每日概览
方案同时要求 Next.js 静态导出、首页打开即显示"今天"、并展示"具体日期"。如果首页在构建时静态生成，那么"今天"和具体日期会固化为构建时状态；如果改为客户端挂载后再计算，则会引入首屏闪烁或水合差异。
**Suggestion**: 明确首页日期状态模型。推荐：首页为客户端组件，挂载后计算今日并提供 skeleton/loading 占位。

#### Issue 2 (Critical): 未来"在线编辑食谱"方向与静态导出方案直接冲突
**Location**: 技术选型；未来扩展点
Next.js `output: export` 模式不支持 API Routes。现在不说明迁移策略，后续会在目录结构、数据访问层和部署方式上返工。
**Suggestion**: 明确 Phase 1 与 Phase 2 的边界。抽象 data access layer，让页面只依赖统一的数据接口。

#### Issue 3 (High): Markdown 解析缺少显式 schema 和构建期校验策略
**Location**: 数据源；项目结构
没有定义 Markdown 的格式约束、必填字段、错误处理和构建失败策略。
**Suggestion**: 用 zod 在构建时做严格校验，错误信息指向 Markdown 的具体段落/字段。

#### Issue 4 (High): 模板建模依赖魔法字符串，类型安全和可维护性不足
**Location**: 核心类型 Templates/DayPlan
`DayPlan` 用 `youTemplate: string` 去引用模板 ID，类型不安全。
**Suggestion**: 直接把 DayPlan 解析为 `{ you: PersonWeighing; wife: PersonWeighing }`，模板复用留在解析层。

#### Issue 5 (High): 数据模型把展示文本和业务数据混在一起
**Location**: PersonWeighing.protein; ShoppingItem.amount
字符串类型的字段后续做汇总、编辑、校验时只能靠字符串解析。
**Suggestion**: 结构化为 `protein: { name, amount, unit, weightBasis }`，`ShoppingItem` 拆成 `quantity + unit + displayAmount`。

#### Issue 6 (High): 勾选状态只按食材名存储，无法应对重名、改版和多计划场景
**Location**: 勾选状态持久化
**Suggestion**: 为每个采购项定义稳定 ID，存储 key 做版本化。

#### Issue 7 (High): 代码质量要求只覆盖 lint/typecheck，没有覆盖测试
**Location**: 代码质量
**Suggestion**: 增加最低测试基线：parser 单元测试、日期映射测试、shopping 状态测试、E2E smoke test。

#### Issue 8 (Medium): 日期导航缺少可分享、可恢复的状态设计
**Location**: 首页每日概览
**Suggestion**: 使用查询参数 `?day=N` 或路由 `/day/[n]`。

#### Issue 9 (Medium): 缺少客户端加载态、异常态定义
**Location**: 采购清单
**Suggestion**: 补充 hydration 前占位态、localStorage 失败降级态、重置确认态。

#### Issue 10 (Medium): 采购清单语义过于粗糙
**Location**: 采购清单调味料合并
**Suggestion**: 区分"需要精确采购的食材"和"家中常备 pantry staples"。

#### Issue 11 (Medium): 可访问性要求缺失
**Location**: 视觉风格；首页
**Suggestion**: 语义化元素、aria-expanded、不只靠颜色区分、触控目标 44px。

#### Issue 12 (Medium): 项目结构缺少关键运行资产描述
**Location**: 项目结构
**Suggestion**: 补上 globals.css、明确 meal-data.ts 是读取预生成 JSON 还是触发解析。

#### Issue 13 (Low): 桌面端宽度限制与双列卡片布局不匹配
**Location**: 响应式设计
**Suggestion**: 桌面端最大宽度提高到 840-960px。

#### Issue 14 (Low): 代码规范项偏窄，没有覆盖格式化和 import 约束
**Location**: 代码质量
**Suggestion**: 补充 Prettier/Biome、import 排序规则。

### Positive Aspects
- 目标用户和核心任务定义清楚，信息架构聚焦
- 提前识别了"熟重/生重"高风险用户错误
- 采购清单本地持久化、移动端优先和未来扩展方向考虑周到

### Summary
最需要优先修正的三点是：静态导出与"今日内容"之间的架构冲突、未来在线编辑与 `output: export` 的不兼容、以及当前数据模型把字符串展示和业务数据耦合得太紧。

**Consensus Status**: NEEDS_REVISION

---

## Round 2 — 2026-03-18

### Overall Assessment
这版修订明显吸收了 Round 1 的大部分意见，方案从“可做原型”提升到了“可以进入实现准备”的水平。当前剩余问题已经不在基础信息架构，而是集中在客户端边界、URL 语义稳定性和状态持久化扩展性这类二阶工程设计细节上。

**Rating**: 8/10

### Previous Round Tracking
| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | 静态导出与“今天”需求冲突 | Resolved | 新增客户端渲染策略、skeleton 和 `useEffect` 日期计算，原始冲突已明确规避。 |
| 2 | 静态导出与未来在线编辑冲突 | Resolved | 明确了 Phase 1/Phase 2 边界，并增加了统一数据访问层。 |
| 3 | Markdown 解析缺少 schema/校验 | Partially Resolved | 已加入 zod 和构建失败策略，但 Markdown 输入语法、单位白名单和字段约束仍未文档化。 |
| 4 | 模板建模依赖魔法字符串 | Resolved | `DayPlan` 已直接内联两人的称重数据，模板复用下沉到解析层。 |
| 5 | 展示文本与业务数据混用 | Resolved | `protein` 和 `ShoppingItem` 已结构化，后续计算和编辑的基础更稳。 |
| 6 | 勾选状态按名称存储 | Partially Resolved | 已改为稳定 ID 和版本 key，但 key 仍未按计划/内容作用域隔离。 |
| 7 | 缺少测试策略 | Resolved | 已补充 parser、日期、状态和 Playwright smoke test。 |
| 8 | 日期导航缺少可分享/恢复状态 | Partially Resolved | `?day=N` 解决了刷新和书签问题，但不能稳定表达“具体日期”。 |
| 9 | 缺少加载态/异常态 | Partially Resolved | 已加入 skeleton、降级和重置确认，但购物页首屏仍会先显示错误的未勾选状态。 |
| 10 | 采购清单语义粗糙 | Resolved | 已拆出“家中常备”语义，并改为调味料逐项列出。 |
| 11 | 可访问性要求缺失 | Resolved | 已补充语义化元素、`aria-expanded`、对比度和触控目标要求。 |
| 12 | 项目结构缺少关键运行资产 | Resolved | 已加入 `globals.css`、`schema.ts`、测试目录和统一 `data.ts`。 |
| 13 | 桌面端宽度限制不匹配 | Resolved | 最大宽度已调整为 960px。 |
| 14 | 代码规范项偏窄 | Partially Resolved | 已补充 Prettier 和 import 规则，但仍缺 Node/包管理器版本基线。 |

### New Issues (if any)
#### Issue 15 (High): 为规避 hydration 问题而把整页做成客户端组件，属于过度修正
**Location**: `### 客户端渲染策略` 第24-30行；`### 数据访问层` 第144-153行
Round 1 的问题是“今日日期”和 localStorage 不能在静态导出时安全确定，但当前修订把首页和采购清单页整体都定义为客户端组件。这会放大客户端 JS 体积、削弱静态 HTML 首屏价值，也让 `lib/data.ts` 的数据边界变得暧昧，因为客户端页面不能直接依赖任何 Node/文件系统读取逻辑。
**Suggestion**: 保持页面壳体和静态内容为服务端/静态组件，只把“当前日期解析”“购物勾选恢复”“URL 同步”做成小型客户端子组件。这样既能保留静态站优势，也能避免把数据访问层错误地下放到客户端。

#### Issue 16 (Medium): `?day=N` 只能表达星期模板，不能稳定表达页面显示的“具体日期”
**Location**: `### 路由` 第159-162行；`### 首页 '/' — 每日概览` 第166-174行
修订版把日期状态编码成 `?day=N`，这确实提升了刷新和书签稳定性，但页面同时承诺展示“具体日期”。如果用户分享 `?day=3`，下周打开得到的仍是“周三模板”，不是原先看到的那一个日历日期，因此“可分享”是部分成立而不是完全成立。
**Suggestion**: 如果页面要展示具体日期并强调可分享，建议把 URL 真源改为 `?date=YYYY-MM-DD`，再由日期推导 `Day N` 和日类型。若只想表达每周模板，则应弱化“具体日期”的可分享含义。

#### Issue 17 (Medium): 购物页 hydration 方案仍会先渲染错误进度，再异步恢复真实状态
**Location**: `### UI 状态` 第220-225行；`### 采购清单 '/shopping'` 第205-216行
当前方案写的是“初始渲染所有项为未勾选，`useEffect` 后从 localStorage 恢复状态”。这意味着顶部“已买 X / 共 Y 项”和进度条在首屏会短暂显示错误值，然后再跳变。Round 1 提出的异常态问题被部分覆盖，但这里仍存在明确的 UX 抖动。
**Suggestion**: 购物页也应像首页一样定义 hydration 前占位策略，例如在状态恢复前隐藏进度数字/勾选状态，或直接显示 checklist skeleton，而不是先渲染一个确定但错误的默认值。

#### Issue 18 (Medium): 勾选状态 key 仍未按计划作用域隔离，与未来多食谱支持冲突
**Location**: `### 勾选状态持久化` 第227-233行；`## 未来扩展点` 第295-296行
虽然 value 已从“名称数组”改为“稳定 ID 数组”，但 localStorage key 仍是全局的 `shopping-checklist:v1`。一旦未来支持多食谱/多 Markdown 文件，同一浏览器下不同计划会共用同一份勾选状态，设计上仍然会互相污染。
**Suggestion**: 现在就把 key 设计为 `shopping-checklist:v1:{planId}` 或附带内容 hash。即使 Phase 1 只有一个计划，也应把作用域字段预留出来，避免未来改存储格式。

#### Issue 19 (Low): 工具链基线仍未明确，初始化可重复性不足
**Location**: `## 代码质量` 第39-45行；`## 项目结构` 第285-290行
修订版补上了 Prettier 和 import 规则，但仍然没有定义最低 Node 版本、包管理器选择和测试命令入口。对于一个尚未初始化的绿地项目，这些属于低成本但高收益的约束，能减少“同一仓库不同机器跑不起来”的摩擦。
**Suggestion**: 在方案中补充环境基线，例如 Node LTS 版本、`pnpm`/`npm` 选择，以及最少的 `lint`、`test`、`build` 脚本约定。 

### Summary
修订版已经把 Round 1 的主问题大幅收敛，剩余风险主要集中在三个点：客户端边界划分过粗、`?day=N` 与“具体日期”的语义不完全一致、以及购物清单持久化尚未为多计划场景留出作用域。它已经接近可实施，但还不建议直接视为最终批准版。

**Consensus Status**: NEEDS_REVISION
