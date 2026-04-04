# PPT 制作工作流

从 Markdown 大纲到专业演讲 PPT 的自动化工作流。

## 工作流程

```
Markdown 大纲 → 解析结构化 JSON → 生成 HTML Slides → 智能配图 → 转换 PPTX → 质量检查
```

## 核心能力

| 阶段 | 工具 | 说明 |
|------|------|------|
| HTML 生成 | Tailwind CSS + 内联样式 | 精美排版，16:9 比例 |
| 配图-素材库 | Unsplash / Pexels API | 免费高质量图片 |
| 配图-AI生图 | Nano Banana Pro (Gemini) | 定制风格一致的插图 |
| PPTX 转换 | html2pptx.js + PptxGenJS | HTML → PPTX |
| 质量检查 | 缩略图网格 + 对比度检测 | 自动 QA |

## 15 种可选风格

详见 [styles/style-gallery.md](styles/style-gallery.md)

| 演讲场景 | 推荐风格 |
|----------|---------|
| 产品发布 | 01 Apple Bento / 06 玻璃态科技 |
| 思想演讲 | 03 TED Talk / 08 编辑排版 |
| 技术分享 | 12 Notion 极简 / 01 Apple Bento |
| 商业路演 | 11 硅谷路演 / 02 McKinsey |
| AI/科技 | 06 玻璃态 / 13 大胆渐变 |
| 品牌故事 | 04 Netflix / 05 Spotify |
| 高端发布 | 10 奢侈品暗金 / 09 Wabi-Sabi |
| 数据报告 | 14 数据可视化 / 02 McKinsey |
| 跨年演讲/发布会 | 15 发布会全图大字 / 03 TED Talk |

## 目录结构

```
PPT制作/
├── README.md              # 本文件
├── styles/
│   └── style-gallery.md   # 14 种风格定义（含配色 Hex）
├── templates/             # HTML slide 模板（按风格分）
├── workspace/
│   ├── input/             # 放入 Markdown 大纲
│   └── output/            # 生成的 PPTX 文件
```

## 使用方式

1. 把大纲放入 `workspace/input/`
2. 告诉 Claude: "用风格 XX 做 PPT"
3. Claude 生成 HTML → 配图 → 转 PPTX
4. 输出到 `workspace/output/`
