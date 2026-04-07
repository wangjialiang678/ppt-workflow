---
name: ppt-workflow
description: "端到端演讲PPT制作工作流。从文档/大纲到专业PPTX的完整流程：需求确认→风格选择→HTML生成→AI配图→转换PPTX→质量审核。当用户说'做PPT'、'制作演讲PPT'、'把大纲变成PPT'、'presentation'时触发。"
---

# 演讲 PPT 端到端制作工作流

从一份文档或大纲，生成专业演讲 PPT。

## 工作流总览

```
文档/大纲 → [确认] → 风格定义 → HTML Slides → AI配图 → PPTX → [审核] → 交付
```

## Phase 1: 需求确认（必须在动手前完成）

收到用户的文档/大纲后，**先读完全文**，然后向用户确认以下事项：

### 1.1 必确认项

| 确认项 | 说明 | 默认值 |
|--------|------|--------|
| **演讲场景** | 校友分享 / 产品发布 / 投资路演 / 行业大会 / 内部汇报 | — |
| **受众画像** | 年龄层、专业背景、关注点 | — |
| **风格偏好** | 展示 style-gallery.md 中的选项，或用户自定义 | 用户选择 |
| **配色方案** | 根据场景推荐 2-3 套配色，让用户选 | 推荐方案 |
| **页数** | 确认是否按大纲页数，是否需要增删 | 按大纲 |
| **配图策略** | AI生图 / 素材库 / 纯排版 / 混合 | AI生图为主 |

### 1.2 风格推荐策略

根据场景推荐，但**始终提供 2-3 个选项让用户选择**（参考项目中的 `PPT制作/styles/style-gallery.md`）：

| 演讲场景 | 推荐风格 |
|----------|---------|
| 校友/行业分享 | 暖白极简 / TED Talk / 编辑排版 |
| 产品发布 | Apple Bento / 玻璃态科技 / 大胆渐变 |
| 投资路演 | 硅谷路演 / McKinsey / Notion极简 |
| 技术分享 | Notion极简 / Apple Bento / 数据可视化 |
| 品牌故事 | Netflix暗色 / Spotify渐变 / Wabi-Sabi |
| 跨年演讲/发布会/年会 | 发布会全图大字 / TED Talk / Netflix暗色 |

### 1.3 确认模板

```
我读完了你的大纲，以下是我的理解和建议：

**内容概要**：[一句话总结]
**建议页数**：X 页（含封面封底）
**推荐风格**：
  A. [风格名] — [一句话描述为什么适合]
  B. [风格名] — [一句话描述为什么适合]
  C. [风格名] — [一句话描述为什么适合]
**推荐配色**：[具体 hex 值]
**配图策略**：[AI生图/素材库/纯排版]

请确认或调整。
```

## Phase 2: 设计系统定义

确认后，定义设计系统常量：

### 2.1 配色板

```javascript
const C = {
  // 浅色页面
  warmBg: '#XXXXXX',     // 主背景
  cardLight: '#XXXXXX',  // 卡片背景
  divider: '#XXXXXX',    // 分割线
  // 文字
  text: '#XXXXXX',       // 主要文字
  textMid: '#XXXXXX',    // 次要文字
  textLight: '#XXXXXX',  // 辅助文字
  // 深色页面
  black: '#XXXXXX',      // 深色背景
  white: '#FFFFFF',       // 深色页文字
  // 强调色（极少量使用）
  accent: '#XXXXXX',     // 细线、小图标
};
```

### 2.2 字体规则

- **统一使用 1 种字体族**，不混搭（避免 Georgia + Arial 混用）
- 仅限 web-safe 字体：Arial, Helvetica, Georgia, Verdana, Tahoma, Trebuchet MS
- 通过字号和字重（bold/normal）建立层次，不靠字体切换

### 2.3 页面节奏

规划哪些页用浅色底、哪些用深色底：
- **深色页**用于：转场、数字冲击、情感高潮、提问
- **浅色页**用于：内容展示、对比、卡片布局
- 深色页不应连续超过 2 页
- 深色页**永远不配图**，让文字单独呼吸

## Phase 3: HTML Slide 生成

### 3.1 技术约束（必须遵守）

| 约束 | 说明 |
|------|------|
| body 尺寸 | `width: 720pt; height: 405pt`（16:9） |
| 文字标签 | 所有文字必须在 `<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>` 内 |
| 无 CSS 渐变 | 不能用 `linear-gradient()`，必须用 Sharp 预渲染为 PNG |
| web-safe 字体 | 不能用 Segoe UI, SF Pro, Roboto 等 |
| body display | 必须 `display: flex` |
| 资源路径 | 放 `/tmp/ppt-assets/`，避免中文路径导致 URL 编码问题 |
| 边距 | 文字距边缘至少 0.5 英寸（36pt），推荐 50-60pt |

### 3.2 Slide Builder 模式

```javascript
// 定义两种 builder 函数
function warmSlide(content) { /* 浅色背景 */ }
function darkSlide(content) { /* 深色背景 */ }

// 每页用函数包装（支持动态图片路径检测）
slides.push(() => {
  const img = imgPath('p1-cover.png');
  // ... 根据图片是否存在决定 HTML
  return warmSlide(`...`);
});
```

### 3.3 图片集成规则

- 图片用 `<img>` 标签，通过 `opacity` 控制透明度
- 背景图用 `position: absolute` + `z-index` 分层
- 文字层用 `position: relative; z-index: 1` 确保在图片上方
- **有图片背景的页面，文字一律用高对比色**（见 Phase 6 审核）

## Phase 4: AI 配图

### 4.1 配图方法论

**核心原则：图片是情绪载体，不是字面插图**

```
错误：文字提到"创业" → 搜索"创业" → 贴上去
正确：这页想让观众感到"温暖的邀请" → "晨光穿过门缝"的视觉隐喻
```

### 4.2 逐页配图决策

对每一页，按以下流程决策：

1. **这页的情绪目标是什么？**（震撼/温暖/思考/紧迫/安静）
2. **视觉主角是谁？**（文字 or 图片？只能有一个）
3. **需要图吗？**
   - 黑底页 → 不用图
   - 数字/对比页 → 靠排版自身力量
   - 情感转折页 → 考虑用图
   - 开头/结尾 → 适合用图建立氛围
4. **如果用图，意境是什么？**（描述感受，不是搜索词）

### 4.3 AI 生图规范

- 使用 Gemini Image API（gemini-2.5-flash-image 或 imagen-4）
- **统一风格指令前缀**，确保全套图片视觉一致：

```
"[统一风格指令], [本页特定意境], no text, 16:9 aspect ratio"
```

- 风格指令示例：`"Cinematic photograph, warm golden hour lighting, minimal composition, soft bokeh, film grain, muted warm tones"`
- 4 张图并行生成（用 4 个子代理）
- 保存到 `/tmp/ppt-assets/images/p{N}-{name}.png`

### 4.4 不适合 AI 生图的情况

| 情况 | 替代方案 |
|------|---------|
| 需要具体产品截图 | 用户提供 |
| 需要真人照片 | Pexels/Unsplash 素材库 |
| 数据图表 | PptxGenJS chart API |
| 简单图形（箭头、圆形） | HTML/CSS 直接画 |

## Phase 5: 构建 PPTX

### 5.1 构建脚本结构

```
workspace/
├── build.js          # 主构建脚本
├── package.json      # 依赖（pptxgenjs, playwright, sharp）
├── slides/           # 生成的 HTML 文件
└── output/           # 最终 PPTX
```

### 5.2 依赖安装

```bash
cd workspace && npm init -y && npm install pptxgenjs playwright sharp
```

### 5.3 构建命令

```bash
cd workspace && NODE_PATH="$(pwd)/node_modules" node build.js
```

### 5.4 常见问题

| 问题 | 解决 |
|------|------|
| MODULE_NOT_FOUND | 设置 `NODE_PATH="$(pwd)/node_modules"` |
| CSS gradients not supported | 用 Sharp 预渲染为 PNG |
| 中文路径 ENOENT | 资源放 `/tmp/ppt-assets/` |
| overflow error | 增大边距，减小字号/内容 |
| LibreOffice not found | 直接 `open` 打开 PPTX 预览 |

## Phase 6: 质量审核（必须执行）

### 6.1 对比度审核（重点）

**对每一页有图片背景的 slide，检查文字对比度：**

| 背景类型 | 文字颜色要求 |
|----------|-------------|
| 浅色底（无图） | 主文字 #1A1A1A，次文字可用灰色 |
| 浅色底 + 低透明度图片 | 主文字 #1A1A1A，次文字也用深色，**避免灰色** |
| 深色底（无图） | 主文字 #FFFFFF，次文字可用 rgba(255,255,255,0.6) |
| 深色底 + 图片 | **不应出现此情况**（深色页不配图） |

**审核规则**：
- 有背景图的页面，所有文字颜色 ≤ `#555555`（足够深），不能用 `#888888` 等浅灰
- 如果图片亮部可能与文字重叠，增大图片透明度或加半透明遮罩

### 6.2 布局审核

- [ ] 所有文字距边缘 ≥ 0.5 英寸
- [ ] 没有文字被截断或溢出
- [ ] 深色页和浅色页交替节奏合理
- [ ] 卡片/列表对齐一致

### 6.3 内容审核

- [ ] 人名、公司名、数字准确
- [ ] 没有错别字
- [ ] 金句/引用与大纲一致

### 6.4 图片审核

- [ ] AI 生图风格统一（色调、质感一致）
- [ ] 图片意境与页面情绪匹配
- [ ] 图片透明度不会喧宾夺主（文字始终是主角）
- [ ] 没有 AI 生图的明显瑕疵（多余手指、文字伪影等）

### 6.5 审核输出

审核完成后，向用户报告：

```
审核通过 / 发现 N 个问题：
1. P{X}: [问题描述] → [已修复/需确认]
2. ...
```

## Phase 7: 交付

1. 打开 PPTX 让用户预览
2. 等待用户反馈
3. 根据反馈迭代（可能回到 Phase 3-6）
4. 用户满意后，最终文件在 `workspace/output/` 中

## 快速参考

### 配图决策速查

```
这页需要图吗？
├─ 黑底页？→ 不用
├─ 纯数字/大字冲击？→ 不用
├─ 结构化内容（卡片/列表/对比）？→ 不用，靠排版
├─ 情感转折/开头/结尾？→ 考虑用 AI 生图
└─ 用图的话 → 情绪目标 → 视觉隐喻 → 统一风格生成
```

### 配色速查

```
文字在浅色底上 → 黑色(#1A1A1A) / 深灰(#555555)
文字在深色底上 → 白色(#FFFFFF) / 浅白(rgba 0.6)
文字在图片上   → 只用黑色(#1A1A1A) 或白色(#FFFFFF)，不用灰色
```

### 技术依赖

- html2pptx: `~/.claude/skills/pptx/scripts/html2pptx.js`
- style-gallery: 项目目录下 `PPT制作/styles/style-gallery.md`
- Gemini API Key: 从 `~/.claude/api-vault.env` 读取 `GEMINI_API_KEY`
- Pexels API Key: 从 `~/.claude/api-vault.env` 读取 `PEXELS_API_KEY`
