# PPT 自动生成工作流 — AI Agent 部署与使用手册

## 1. 概述

本仓库是一套面向 AI Agent（Claude Code、OpenClaw 等）的 PPT 全自动生成工作流。Agent 接收用户的主题或大纲，经过需求确认、风格选择（15 种）、HTML 幻灯片生成、AI 智能配图、PPTX 转换、质量审核六个阶段，最终输出可直接使用的 `.pptx` 文件。所有能力以 Skill 形式安装到 Agent 的技能目录，Node.js 脚本负责将 HTML 渲染为 PPTX，Python 脚本负责调用 Gemini / Pexels API 生成与搜索配图。

```
用户需求 → 需求确认 → 风格选择(15种) → HTML幻灯片 → AI配图 → PPTX → 质量审核 → 输出文件
```

---

## 2. 前置条件

在执行部署步骤前，确认以下环境已就绪：

| 依赖 | 最低版本 | 说明 |
|------|---------|------|
| Node.js | 18+ | 用于运行 html2pptx 转换脚本 |
| Python | 3.10+ | 用于 AI 配图脚本（google-genai / Pillow） |
| npm | 随 Node.js 附带 | 安装 Node.js 依赖 |
| pip | 随 Python 附带 | 安装 Python 依赖 |
| AI Agent | Claude Code / OpenClaw / 同类工具 | 执行 Skill 的宿主环境 |

验证命令：

```bash
node --version    # 应输出 v18.x.x 或更高
python3 --version # 应输出 3.10.x 或更高
```

---

## 3. 部署步骤（供 AI Agent 执行）

以下步骤应由 AI Agent 按顺序执行，每步完成后验证再继续。

### 步骤 1：克隆仓库

```bash
git clone https://github.com/your-org/ppt-workflow-package.git /tmp/ppt-workflow-package
cd /tmp/ppt-workflow-package
```

> 如果已有本地副本，跳过克隆，直接进入步骤 2。

### 步骤 2：安装 4 个 Skills 到 Agent 技能目录

将所有 Skill 复制到 `~/.claude/skills/`，然后逐一验证：

```bash
# 创建目标目录（如不存在）
mkdir -p ~/.claude/skills

# 复制 4 个 Skill
cp -R /tmp/ppt-workflow-package/skills/ppt-workflow   ~/.claude/skills/
cp -R /tmp/ppt-workflow-package/skills/pptx           ~/.claude/skills/
cp -R /tmp/ppt-workflow-package/skills/nano-banana    ~/.claude/skills/
cp -R /tmp/ppt-workflow-package/skills/image-forge    ~/.claude/skills/

# 验证：每个目录下应有 SKILL.md
ls ~/.claude/skills/ppt-workflow/SKILL.md
ls ~/.claude/skills/pptx/SKILL.md
ls ~/.claude/skills/nano-banana/SKILL.md
ls ~/.claude/skills/image-forge/SKILL.md
```

每条 `ls` 命令应返回文件路径而非报错。若任何一个失败，重新执行对应的 `cp -R` 命令。

各 Skill 职责说明：

| Skill | 职责 |
|-------|------|
| `ppt-workflow` | 主工作流编排，协调全部 7 个阶段 |
| `pptx` | HTML → PPTX 转换工具集（html2pptx） |
| `nano-banana` | AI 配图生成（调用 Gemini Imagen 模型） |
| `image-forge` | AI 配图备选方案 |

### 步骤 3：安装 Node.js 依赖

```bash
cd /tmp/ppt-workflow-package/PPT制作/workspace
npm install
npx playwright install chromium
```

`npm install` 安装 `pptxgenjs`、`playwright`、`sharp` 三个核心依赖。
`npx playwright install chromium` 下载 Chromium 浏览器，html2pptx 将 HTML 渲染为截图时需要。

验证：

```bash
cd /tmp/ppt-workflow-package/PPT制作/workspace
node -e "require('pptxgenjs'); console.log('pptxgenjs OK')"
node -e "require('playwright'); console.log('playwright OK')"
```

两行均应输出 `OK`，否则重新执行 `npm install`。

### 步骤 4：安装 Python 依赖

```bash
pip install google-genai Pillow
```

验证：

```bash
python3 -c "import google.genai; print('google-genai OK')"
python3 -c "from PIL import Image; print('Pillow OK')"
```

### 步骤 5：配置 API Keys

**重要：不要将真实 Key 写入仓库文件。** Keys 应写入 `~/.claude/api-vault.env`，由 Agent 在运行时读取。

先查看模板，了解所需变量名：

```bash
cat /tmp/ppt-workflow-package/api-keys/api-keys.env.example
```

模板内容如下：

```
# Google Gemini - AI 图片生成
# 获取地址: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Pexels - 免费图片素材
# 获取地址: https://www.pexels.com/api/
PEXELS_API_KEY=your_pexels_api_key_here
```

由用户提供真实 Key 后，Agent 执行以下命令写入 api-vault：

```bash
# 追加到 api-vault（不覆盖已有内容）
cat >> ~/.claude/api-vault.env << 'EOF'
GEMINI_API_KEY=<用户提供的真实Key>
PEXELS_API_KEY=<用户提供的真实Key>
EOF
```

如果用户尚未提供 Key，在此步骤暂停并向用户询问，不要用占位符继续。

Key 获取地址详见第 8 节。

### 步骤 6：验证部署

执行端到端快速验证：

```bash
cd /tmp/ppt-workflow-package/PPT制作/workspace

node -e "
const PptxGenJS = require('pptxgenjs');
const { chromium } = require('playwright');
console.log('所有模块加载成功');
"
```

输出 `所有模块加载成功` 表示 Node.js 环境正常。

Python 环境验证：

```bash
python3 -c "
import os
import google.genai
from PIL import Image
key = os.environ.get('GEMINI_API_KEY', '')
print('Python 依赖 OK')
print('GEMINI_API_KEY:', '已设置' if key else '未设置（需要在 api-vault.env 中配置）')
"
```

### 步骤 7：向用户报告

部署完成后，向用户输出以下摘要：

```
PPT 工作流部署完成。

已安装 Skills：
  ~/.claude/skills/ppt-workflow/
  ~/.claude/skills/pptx/
  ~/.claude/skills/nano-banana/
  ~/.claude/skills/image-forge/

Node.js 依赖：pptxgenjs、playwright、sharp（已安装）
Python 依赖：google-genai、Pillow（已安装）
Chromium：已下载

API Keys 状态：
  GEMINI_API_KEY: [已配置 / 未配置]
  PEXELS_API_KEY: [已配置 / 未配置]

现在可以说「做PPT」开始使用。
```

---

## 4. 使用方法

部署完成后，在 Claude Code 或支持 Skill 的 Agent 中直接发送自然语言指令：

```
# 最简单的方式
做一个关于"AI改变工作方式"的PPT

# 指定风格
做PPT，主题是"2025年营销趋势"，风格选 Silicon Valley Pitch

# 提供大纲
把下面的大纲做成PPT，风格用 McKinsey Consulting Blue：
[粘贴大纲内容]

# 触发完整工作流（Agent 会主动引导需求确认）
/ppt-workflow
```

Agent 会按以下顺序执行：

1. 确认主题、受众、页数、风格
2. 生成 Markdown 大纲
3. 将大纲转为 HTML 幻灯片
4. 调用 nano-banana / image-forge 为每页生成配图
5. 调用 pptx skill 将 HTML 截图转为 PPTX
6. 质量审核（配色对比度、图文可读性）
7. 输出 `.pptx` 文件路径

---

## 5. 可用风格（15 种）

| 编号 | 风格名称 | 适用场景 |
|------|---------|---------|
| 1 | Apple Bento Grid | 产品发布、科技展示 |
| 2 | McKinsey Consulting Blue | 商业汇报、咨询报告 |
| 3 | TED Talk Minimal | 演讲、思想传播 |
| 4 | Netflix Dark Entertainment | 创意展示、品牌故事 |
| 5 | Spotify Gradient | 年轻品牌、音乐文化 |
| 6 | Glass-Morphism Tech | AI/科技主题 |
| 7 | Brutalism | 先锋设计、颠覆性内容 |
| 8 | Editorial Magazine | 文化、艺术、深度内容 |
| 9 | Wabi-Sabi | 禅意、东方美学 |
| 10 | Luxury Dark Gold | 高端品牌、奢侈品 |
| 11 | Silicon Valley Pitch | 创业路演、融资演示 |
| 12 | Notion/Linear Minimal | 内部分享、技术文档 |
| 13 | Bold Gradient | 营销活动、宣传推广 |
| 14 | Data Visualization | 数据报告、分析展示 |
| 15 | 发布会全图大字 | 发布会、TED 式演讲 |

完整风格参数（配色、字体、布局规范）见 `PPT制作/styles/style-gallery.md`。

---

## 6. 故障排查

| 错误信息 | 原因 | 修复方法 |
|---------|------|---------|
| `MODULE_NOT_FOUND: html2pptx` | Skills 未正确安装 | 重新执行步骤 2，确认 `~/.claude/skills/pptx/SKILL.md` 存在 |
| `MODULE_NOT_FOUND: pptxgenjs` | Node.js 依赖未安装 | `cd /tmp/ppt-workflow-package/PPT制作/workspace && npm install` |
| `browserType.launch: Failed to launch` | Chromium 未下载 | `cd /tmp/ppt-workflow-package/PPT制作/workspace && npx playwright install chromium` |
| `GEMINI_API_KEY not set` 或配图全部失败 | API Key 未配置 | 检查 `~/.claude/api-vault.env`，补充 `GEMINI_API_KEY=...` |
| `No module named 'google.genai'` | Python 依赖缺失 | `pip install google-genai` |
| `No module named 'PIL'` | Pillow 未安装 | `pip install Pillow` |
| `ENOENT` 含中文路径 | 路径含中文导致写入失败 | 工作流会自动将临时文件写入 `/tmp/ppt-assets/`，无需手动处理 |
| `NODE_PATH` 相关模块解析错误 | 在错误目录执行了 node | 在 workspace 目录执行命令，或在命令前加 `NODE_PATH="$(pwd)/node_modules"` |
| `sharp` 安装报错（native binding） | Node.js 版本不兼容 | 升级到 Node.js 18+ 或执行 `npm rebuild sharp` |
| 生成的 PPTX 文字对比度差 | 图片背景下使用了灰色文字 | 有图片背景的页面文字颜色必须使用纯黑 `#1A1A1A` 或纯白 `#FFFFFF` |

---

## 7. 仓库结构

```
ppt-workflow-package/
├── README.md                              ← 本文件（AI Agent 部署手册）
│
├── skills/                                ← 安装到 ~/.claude/skills/ 的技能包
│   ├── ppt-workflow/
│   │   └── SKILL.md                       ← 主工作流编排（7阶段流程定义）
│   ├── pptx/
│   │   ├── SKILL.md                       ← html2pptx 技能入口
│   │   ├── html2pptx.md                   ← HTML→PPTX 转换详细规范
│   │   ├── ooxml/                         ← OOXML 原生操作工具
│   │   └── ooxml.md                       ← OOXML 操作说明
│   ├── nano-banana/
│   │   └── SKILL.md                       ← Gemini AI 配图生成技能
│   └── image-forge/
│       └── SKILL.md                       ← 备选 AI 配图技能
│
├── PPT制作/                               ← 核心构建目录
│   ├── styles/
│   │   └── style-gallery.md               ← 15种风格完整参数（配色/字体/布局）
│   ├── workspace/                         ← Node.js 构建环境
│   │   ├── build.js                       ← 主构建脚本（HTML→截图→PPTX）
│   │   ├── package.json                   ← 依赖清单（pptxgenjs/playwright/sharp）
│   │   ├── package-lock.json              ← 锁定依赖版本
│   │   ├── slides/                        ← HTML 幻灯片模板文件
│   │   └── assets/                        ← 渐变背景等静态素材
│   └── docs/
│       └── ppt-image-strategy-20260331.md ← AI 配图策略文档（情绪匹配原则）
│
└── api-keys/
    └── api-keys.env.example               ← API Key 模板（不含真实值，仅供参考）
```

---

## 8. API Keys 说明

本工作流需要两个 API Key，均需由用户自行注册获取，不要使用他人的 Key。

### GEMINI_API_KEY

- **用途**：调用 Google Gemini（Imagen 模型）AI 生成配图
- **获取地址**：https://aistudio.google.com/apikey
- **免费额度**：提供免费层，日常 PPT 制作用量足够

### PEXELS_API_KEY

- **用途**：搜索 Pexels 免费图片素材库（备选配图来源）
- **获取地址**：https://www.pexels.com/api/
- **免费额度**：完全免费，注册账号后即可申请

### 配置位置

Keys 统一写入 `~/.claude/api-vault.env`，格式如下：

```
GEMINI_API_KEY=你的真实Key（不含引号）
PEXELS_API_KEY=你的真实Key（不含引号）
```

**安全须知：**

- 不要将真实 Key 提交到 Git 仓库
- `api-keys/api-keys.env.example` 仅包含占位符，不含任何真实值，可以安全提交
- `~/.claude/api-vault.env` 是本地文件，不会被同步到远程仓库
- Agent 在执行配图步骤前会自动从 `api-vault.env` 读取 Key，无需每次手动 export
