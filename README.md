# PPT 自动生成工作流 - 安装指南

## 工作流概览

```
Markdown大纲 → 需求确认 → 风格选择(15种) → HTML幻灯片 → AI配图 → PPTX → 质量审核
```

## 前置条件

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 已安装
- Node.js 18+
- Python 3.10+（AI 配图脚本用）

## 安装步骤

### 1. 复制 Skills

```bash
# 将 4 个 skill 文件夹复制到你的 Claude Code skills 目录
cp -R skills/ppt-workflow ~/.claude/skills/
cp -R skills/pptx ~/.claude/skills/
cp -R skills/nano-banana ~/.claude/skills/
cp -R skills/image-forge ~/.claude/skills/
```

### 2. 复制 PPT制作 项目目录

```bash
# 复制到你的工作目录（位置可自选）
cp -R PPT制作 ~/你的工作目录/PPT制作
```

### 3. 安装依赖

```bash
cd ~/你的工作目录/PPT制作/workspace
npm install
# 安装 Playwright 浏览器（html2pptx 需要）
npx playwright install chromium
```

```bash
# Python 依赖（AI 配图）
pip install google-genai Pillow
```

### 4. 配置 API Key

```bash
# 复制示例文件并填入你自己的 Key
cp api-keys/api-keys.env.example api-keys/api-keys.env
# 编辑 api-keys.env，填入真实 Key

# 然后追加到你的 api-vault
cat api-keys/api-keys.env >> ~/.claude/api-vault.env

# 或者手动设置环境变量
export GEMINI_API_KEY="你的key"    # Google Gemini - AI 图片生成
export PEXELS_API_KEY="你的key"    # Pexels - 免费图片素材
```

> API Key 说明：
> - **GEMINI_API_KEY**: 用于 AI 生成配图（Nano Banana / Imagen 模型），[获取地址](https://aistudio.google.com/apikey)
> - **PEXELS_API_KEY**: 用于搜索免费图片素材，[获取地址](https://www.pexels.com/api/)

### 5. 验证安装

在 Claude Code 中输入：

```
做一个3页的测试PPT，主题是"AI改变工作方式"
```

如果能走通完整流程并生成 .pptx 文件，安装成功。

## 使用方法

在 Claude Code 中：

```
# 方式1：直接说
做PPT，主题是xxx，风格选Apple Bento

# 方式2：提供大纲文件
把这个大纲做成PPT：[粘贴大纲或提供文件路径]

# 方式3：触发完整工作流
/ppt-workflow
```

## 可用风格（15种）

| 风格 | 适用场景 |
|------|----------|
| Apple Bento Grid | 产品发布、科技展示 |
| McKinsey Consulting Blue | 商业汇报、咨询报告 |
| TED Talk Minimal | 演讲、思想传播 |
| Netflix Dark Entertainment | 创意展示、品牌故事 |
| Spotify Gradient | 年轻品牌、音乐文化 |
| Glass-Morphism Tech | AI/科技主题 |
| Brutalism | 先锋设计、颠覆性内容 |
| Editorial Magazine | 文化、艺术、深度内容 |
| Wabi-Sabi | 禅意、东方美学 |
| Luxury Dark Gold | 高端品牌、奢侈品 |
| Silicon Valley Pitch | 创业路演、融资 |
| Notion/Linear Minimal | 内部分享、技术文档 |
| Bold Gradient | 营销、活动宣传 |
| Data Visualization | 数据报告、分析展示 |
| 发布会全图大字 | 发布会、TED式演讲 |

完整风格参数见 `PPT制作/styles/style-gallery.md`。

## 目录结构

```
ppt-workflow-package/
├── README.md              ← 本文件
├── skills/
│   ├── ppt-workflow/      ← 主工作流编排（7阶段）
│   ├── pptx/              ← HTML→PPTX 转换工具集
│   ├── nano-banana/       ← AI 图片生成（Gemini）
│   └── image-forge/       ← AI 图片生成（备选）
├── PPT制作/
│   ├── styles/            ← 15种风格定义
│   ├── workspace/         ← 构建脚本 + 依赖
│   │   ├── build.js       ← 主构建脚本
│   │   ├── package.json   ← Node.js 依赖
│   │   ├── slides/        ← HTML 幻灯片模板
│   │   └── assets/        ← 渐变背景等素材
│   └── docs/              ← 配图策略文档
└── api-keys/
    └── api-keys.env.example ← API 密钥模板（填入你自己的 Key）
```

## 注意事项

- AI 配图基于情绪匹配而非关键词，详见 `PPT制作/docs/ppt-image-strategy-20260331.md`
- 有图片背景的页面，文字必须用纯黑(#1A1A1A)或纯白(#FFFFFF)，不能用灰色
