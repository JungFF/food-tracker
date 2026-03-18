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
