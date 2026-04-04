---
name: image-forge
description: >
  AI 图片生成与 Logo 设计工具。基于 Gemini Image API，融合专业 Logo 设计理论和 AI 提示词工程。
  支持：Logo 设计（品牌分析→多方案→迭代精修）、App 图标、插画、产品图、编辑修图。
  触发词：logo、图标、icon、生成图片、设计logo、app icon、favicon、生成插画、AI画图、nano banana。
allowed-tools: Bash(~/.claude/skills/image-forge/scripts/*)
---

# Image Forge — AI 图片生成 & Logo 设计

融合 4 个开源 Skill 精髓的自用图片生成工具。

## 设计哲学

> 取自 svg-logo-designer 的品牌理论 + logo-design-guide 的提示词工程 + nano-banana 的 Gemini API + 6-agent 的流程框架，去其糟粕。

## 环境

- **API**: `GEMINI_API_KEY`（从 `~/.claude/api-vault.env` 读取）
- **Python**: `~/.claude/skills/image-forge/.venv/`
- **输出**: 项目 `design-preview/` 或指定路径

执行脚本前总是这样调用：
```bash
source ~/.claude/api-vault.env && source ~/.claude/skills/image-forge/.venv/bin/activate && python3 ~/.claude/skills/image-forge/scripts/<script>.py [args]
```

## 脚本

| 脚本 | 用途 |
|------|------|
| `generate.py` | 文字→图片（通用生成） |
| `edit.py` | 编辑已有图片 |
| `batch.py` | 批量生成多个变体 |

## Logo 设计工作流

这是本 Skill 的核心价值——不是简单调 API，而是有设计方法论。

### Phase 1: 品牌分析（Claude 自己做，不调 API）

在调用任何生成脚本前，必须先完成：

1. **品牌定位**：名称含义、行业、目标用户、品牌调性
2. **竞品速查**：同类产品的 Logo 风格（避免撞脸）
3. **关键词提炼**：3-5 个核心视觉关键词
4. **风格方向**：选定 2-3 个方向（见下方模板）

### Phase 2: 方案生成（调 API）

用 `batch.py` 一次生成 3-5 个方向：

```bash
source ~/.claude/api-vault.env && source ~/.claude/skills/image-forge/.venv/bin/activate && python3 ~/.claude/skills/image-forge/scripts/batch.py \
  --prompts prompts.yaml \
  --output-dir ./design-preview/logos/ \
  --aspect 1:1
```

### Phase 3: 迭代精修（调 edit.py）

选定方向后用 edit.py 微调：

```bash
source ~/.claude/api-vault.env && source ~/.claude/skills/image-forge/.venv/bin/activate && python3 ~/.claude/skills/image-forge/scripts/edit.py \
  chosen.png "Make the lines thinner, increase whitespace, remove text" refined.png
```

### Phase 4: 变体导出

生成不同用途的版本：
- 全彩版 / 单色版 / 反白版
- App icon (1024x1024) / Favicon (64x64) / 社交头像

## Logo 提示词模板

### 关键规则（来自 logo-design-guide 的实战经验）

**有效关键词：**
```
flat vector logo, simple minimal icon, single color silhouette,
geometric logo mark, clean lines, negative space design,
line art logo, flat design icon, minimalist symbol, no text
```

**无效关键词（避免使用）：**
```
❌ photorealistic logo    → 矛盾，Logo 不是照片
❌ 3D rendered logo       → 太复杂，缩小后模糊
❌ gradient logo          → AI 生成不稳定
❌ logo with text "Name"  → AI 画文字会乱码
```

**提示词结构：**
```
flat vector logo of [主体], [风格], [颜色约束], [背景], [补充细节], no text
```

### 方向模板

**A. 几何抽象**
```
flat vector abstract logo mark, [形状描述] forming [概念],
minimal geometric style, single [颜色] color, white background,
clean sharp edges, no text
```

**B. 图形标志**
```
flat vector logo of [具象物体] in [角度/姿态],
geometric faceted style, [主色] and white,
minimal clean lines, white background, negative space design, no text
```

**C. 线条极简**
```
minimal line art logo, single continuous line forming [形状],
[颜色] on white background, elegant thin strokes,
modern minimalist style, no text
```

**D. 图标风格（适合 App Icon）**
```
modern app icon design, [主体] symbol,
rounded square background in [颜色], white icon element,
flat design, clean and bold, suitable for mobile app, no text
```

## 通用图片生成

非 Logo 场景直接用 generate.py：

```bash
source ~/.claude/api-vault.env && source ~/.claude/skills/image-forge/.venv/bin/activate && python3 ~/.claude/skills/image-forge/scripts/generate.py \
  "描述" output.png --aspect 16:9 --size 2K
```

## 展示结果

生成完成后，用 Read 工具读取图片文件展示给用户。
用户选择方案后进入迭代精修。
