const pptxgen = require('pptxgenjs');
const html2pptx = require('/Users/michael/.claude/skills/pptx/scripts/html2pptx');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SLIDES_DIR = path.join(__dirname, 'slides');
const ASSETS_DIR = '/tmp/ppt-assets';
const IMG_DIR = '/tmp/ppt-assets/images';
const OUTPUT = path.join(__dirname, 'output', 'AI+OPC-交大校友演讲.pptx');

// === Color Palette: Black + Warm White ===
const C = {
  warmBg: '#F8F5F0',
  black: '#0A0A0A',
  text: '#1A1A1A',
  textMid: '#555555',
  textLight: '#888888',
  white: '#FFFFFF',
  warmWhite: '#F0EDE6',
  divider: '#E0DCD4',
  accent: '#C9A84C',      // subtle gold for thin lines only
  cardDark: '#1A1A1A',
  cardLight: '#EFECE5',
};

// === Gradient Backgrounds ===
async function createGradients() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const gradients = [
    { name: 'dark-gradient.png', c1: '#0A0A0A', c2: '#1A1A1A', angle: '135' },
  ];
  for (const g of gradients) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810">
      <defs><linearGradient id="g" x1="0%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" style="stop-color:${g.c1}"/><stop offset="100%" style="stop-color:${g.c2}"/>
      </linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`;
    await sharp(Buffer.from(svg)).png().toFile(path.join(ASSETS_DIR, g.name));
  }
  // Thin accent line
  const lineSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="3"><rect width="120" height="3" fill="${C.accent}"/></svg>`;
  await sharp(Buffer.from(lineSvg)).png().toFile(path.join(ASSETS_DIR, 'accent-line.png'));
}

// === HTML Builders ===
function warmSlide(content) {
  return `<!DOCTYPE html><html><head><style>
html { background: ${C.warmBg}; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; background: ${C.warmBg}; font-family: Arial, sans-serif; display: flex; flex-direction: column; box-sizing: border-box; }
</style></head><body>${content}</body></html>`;
}

function darkSlide(content) {
  return `<!DOCTYPE html><html><head><style>
html { background: ${C.black}; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; background-image: url('${path.join(ASSETS_DIR, 'dark-gradient.png')}'); background-size: cover; font-family: Arial, sans-serif; display: flex; flex-direction: column; box-sizing: border-box; }
</style></head><body>${content}</body></html>`;
}

function imgPath(name) {
  const p = path.join(IMG_DIR, name);
  return fs.existsSync(p) ? p : null;
}

// === Slide Definitions ===
const slides = [];

// P1 - 封面 (warm + AI generated cover image)
slides.push(() => {
  const img = imgPath('p1-cover.png') || imgPath('cover.jpg');
  const imgHtml = img ? `<div style="position: absolute; top: 0; right: 0; width: 340pt; height: 405pt; overflow: hidden;"><img src="${img}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.35;"></div>` : '';
  return warmSlide(`
<div style="position: relative; flex: 1; display: flex; flex-direction: column;">
  ${imgHtml}
  <div style="margin: 70pt 60pt 40pt 60pt; display: flex; flex-direction: column; flex: 1; justify-content: center; position: relative; z-index: 1;">
    <div style="margin-bottom: 14pt;"><img src="${path.join(ASSETS_DIR, 'accent-line.png')}" style="width: 60pt; height: 2pt;"></div>
    <h1 style="font-size: 38pt; color: ${C.text}; margin: 0 0 14pt 0; line-height: 1.3; font-weight: bold;">AI+OPC</h1>
    <h2 style="font-size: 24pt; color: ${C.textMid}; margin: 0 0 30pt 0; line-height: 1.3; font-weight: normal;">带给每个人的创新机遇</h2>
    <p style="font-size: 15pt; color: ${C.textLight}; margin: 0;">王佳梁 &nbsp;|&nbsp; 交大校友 &nbsp;|&nbsp; 超脑AI孵化器创始人</p>
  </div>
  <div style="margin: 0 60pt 24pt 60pt;">
    <p style="font-size: 10pt; color: ${C.textLight}; margin: 0;">2026年4月</p>
  </div>
</div>`);
});

// P2 - 四个数字 (DARK)
slides.push(() => darkSlide(`
<div style="margin: 50pt 60pt; display: flex; flex-direction: column; flex: 1; justify-content: center; align-items: center;">
  <p style="font-size: 13pt; color: ${C.textLight}; margin: 0 0 24pt 0; letter-spacing: 3pt;">我的四次创业，团队人数的变化</p>
  <div style="display: flex; align-items: baseline; gap: 20pt; margin-bottom: 30pt;">
    <h1 style="font-size: 72pt; color: ${C.white}; margin: 0; font-weight: bold;">900</h1>
    <p style="font-size: 30pt; color: ${C.textLight}; margin: 0;">→</p>
    <h1 style="font-size: 64pt; color: rgba(255,255,255,0.85); margin: 0; font-weight: bold;">80</h1>
    <p style="font-size: 30pt; color: ${C.textLight}; margin: 0;">→</p>
    <h1 style="font-size: 56pt; color: rgba(255,255,255,0.7); margin: 0; font-weight: bold;">12</h1>
    <p style="font-size: 30pt; color: ${C.textLight}; margin: 0;">→</p>
    <h1 style="font-size: 48pt; color: ${C.warmWhite}; margin: 0; font-weight: bold;">3</h1>
  </div>
  <p style="font-size: 14pt; color: rgba(255,255,255,0.5); margin: 0; text-align: center;">数字在变小，但每一次离自己想做的事更近了</p>
</div>
`));

// P3 - 触宝 900人时代
slides.push(() => {
  const imgCol = '';
  return warmSlide(`
<div style="margin: 50pt 60pt; display: flex; flex-direction: column; flex: 1;">
  <p style="font-size: 11pt; color: ${C.textLight}; margin: 0 0 8pt 0; letter-spacing: 2pt; text-transform: uppercase;">第一次创业</p>
  <h1 style="font-size: 34pt; color: ${C.text}; margin: 0 0 24pt 0; font-weight: bold;">触宝：900人时代</h1>
  <div style="display: flex; gap: 24pt; flex: 1;">
    <div style="flex: 1; display: flex; flex-direction: column;">
      <div style="background: ${C.cardLight}; border-radius: 8pt; padding: 20pt; margin-bottom: 16pt;">
        <p style="font-size: 18pt; color: ${C.text}; margin: 0; font-weight: bold;">触屏输入法 · 纽交所 · 900+人</p>
      </div>
      <div style="border-left: 3pt solid ${C.text}; padding-left: 16pt; margin-top: 8pt;">
        <p style="font-size: 20pt; color: ${C.text}; margin: 0; line-height: 1.5;">要干大事，就得有大团队</p>
        <p style="font-size: 14pt; color: ${C.textLight}; margin: 6pt 0 0 0;">——这是那个时代的常识</p>
      </div>
    </div>
    ${imgCol}
  </div>
</div>`);
});

// P4 - 四次创业对比
slides.push(() => warmSlide(`
<div style="margin: 40pt 50pt; display: flex; flex-direction: column; flex: 1;">
  <h1 style="font-size: 28pt; color: ${C.text}; margin: 0 0 22pt 0; font-weight: bold;">四次创业对比</h1>
  <div style="display: flex; gap: 12pt; flex: 1;">
    <div style="flex: 1; background: ${C.cardLight}; border-radius: 8pt; padding: 18pt; display: flex; flex-direction: column;">
      <p style="font-size: 36pt; color: ${C.text}; margin: 0 0 6pt 0; font-weight: bold;">900+</p>
      <p style="font-size: 14pt; color: ${C.text}; margin: 0 0 10pt 0; font-weight: bold;">触宝</p>
      <p style="font-size: 11pt; color: ${C.textLight}; margin: 0;">移动互联网早期</p>
    </div>
    <div style="flex: 1; background: ${C.cardLight}; border-radius: 8pt; padding: 18pt; display: flex; flex-direction: column;">
      <p style="font-size: 36pt; color: ${C.text}; margin: 0 0 6pt 0; font-weight: bold;">80+</p>
      <p style="font-size: 14pt; color: ${C.text}; margin: 0 0 10pt 0; font-weight: bold;">手游公司</p>
      <p style="font-size: 11pt; color: ${C.textLight}; margin: 0;">移动互联网成熟</p>
    </div>
    <div style="flex: 1; background: ${C.cardLight}; border-radius: 8pt; padding: 18pt; display: flex; flex-direction: column;">
      <p style="font-size: 36pt; color: ${C.text}; margin: 0 0 6pt 0; font-weight: bold;">12</p>
      <p style="font-size: 14pt; color: ${C.text}; margin: 0 0 10pt 0; font-weight: bold;">线下密室</p>
      <p style="font-size: 11pt; color: ${C.textLight}; margin: 0;">体验经济</p>
    </div>
    <div style="flex: 1; background: ${C.text}; border-radius: 8pt; padding: 18pt; display: flex; flex-direction: column;">
      <p style="font-size: 36pt; color: ${C.warmWhite}; margin: 0 0 6pt 0; font-weight: bold;">3+AI</p>
      <p style="font-size: 14pt; color: rgba(255,255,255,0.8); margin: 0 0 10pt 0; font-weight: bold;">超脑AI孵化器</p>
      <p style="font-size: 11pt; color: rgba(255,255,255,0.5); margin: 0;">AI原生</p>
    </div>
  </div>
  <div style="margin-top: 16pt; border-top: 1pt solid ${C.divider}; padding-top: 14pt;">
    <p style="font-size: 16pt; color: ${C.text}; margin: 0; text-align: center;">过去创业是<span style="font-weight: bold;">找人</span>的艺术，未来创业是<span style="font-weight: bold;">不找人</span>的艺术</p>
  </div>
</div>
`));

// P5 - 转场 (DARK)
slides.push(() => darkSlide(`
<div style="margin: 60pt; display: flex; flex-direction: column; flex: 1; justify-content: center; align-items: center;">
  <h1 style="font-size: 44pt; color: ${C.white}; margin: 0; text-align: center; line-height: 1.5; font-weight: bold;">不是我变强了<br>是AI变强了</h1>
</div>
`));

// P6 - 我的真实工作方式
slides.push(() => {
  const imgCol = `<div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
      <div style="border-left: 3pt solid ${C.text}; padding-left: 16pt;">
        <p style="font-size: 15pt; color: ${C.text}; margin: 0 0 12pt 0; line-height: 1.6;">不是在给它下指令</p>
        <p style="font-size: 15pt; color: ${C.text}; margin: 0 0 12pt 0; line-height: 1.6;">是在跟它<span style="font-weight: bold;">异步协作</span></p>
        <p style="font-size: 14pt; color: ${C.textLight}; margin: 0; line-height: 1.6;">给目标、给上下文、给自由度</p>
      </div>
    </div>`;
  return warmSlide(`
<div style="margin: 45pt 55pt; display: flex; flex-direction: column; flex: 1;">
  <p style="font-size: 11pt; color: ${C.textLight}; margin: 0 0 8pt 0; letter-spacing: 2pt;">真实工作方式</p>
  <h1 style="font-size: 30pt; color: ${C.text}; margin: 0 0 22pt 0; font-weight: bold;">一个人 + AI合伙人</h1>
  <div style="display: flex; gap: 20pt; flex: 1;">
    <div style="flex: 1; display: flex; flex-direction: column; gap: 12pt;">
      <div style="background: ${C.text}; border-radius: 8pt; padding: 20pt;">
        <p style="font-size: 36pt; color: ${C.warmWhite}; margin: 0; font-weight: bold;">$250</p>
        <p style="font-size: 12pt; color: rgba(255,255,255,0.6); margin: 4pt 0 0 0;">AI合伙人月费</p>
      </div>
      <div style="background: ${C.text}; border-radius: 8pt; padding: 20pt;">
        <p style="font-size: 36pt; color: ${C.warmWhite}; margin: 0; font-weight: bold;">34<span style="font-size: 18pt; color: rgba(255,255,255,0.5);"> 分钟</span></p>
        <p style="font-size: 12pt; color: rgba(255,255,255,0.6); margin: 4pt 0 0 0;">77份文档 → 完整竞品分析</p>
      </div>
    </div>
    ${imgCol}
  </div>
</div>`);
});

// P7 - 公司是工业时代的补丁
slides.push(() => warmSlide(`
<div style="margin: 50pt 60pt; display: flex; flex-direction: column; flex: 1; justify-content: center;">
  <h1 style="font-size: 40pt; color: ${C.text}; margin: 0 0 24pt 0; font-weight: bold;">公司这个发明才200年</h1>
  <div style="display: flex; align-items: center; margin-bottom: 8pt;">
    <div style="background: ${C.divider}; height: 8pt; flex: 20; border-radius: 4pt;"></div>
    <div style="background: ${C.text}; height: 8pt; flex: 1; border-radius: 4pt; margin-left: 2pt;"></div>
  </div>
  <div style="display: flex; justify-content: space-between; margin-bottom: 30pt;">
    <p style="font-size: 11pt; color: ${C.textLight}; margin: 0;">20万年前 · 智人出现</p>
    <p style="font-size: 11pt; color: ${C.text}; margin: 0; font-weight: bold;">200年前 · 现代公司诞生</p>
  </div>
  <p style="font-size: 17pt; color: ${C.textMid}; margin: 0; line-height: 1.6;">人类99%的历史是个体或小团体协作。<br>AI正在消除"一个人干不了大事"这个前提。</p>
</div>
`));

// P8 - AI+OPC = 一人公司
slides.push(() => warmSlide(`
<div style="margin: 45pt 55pt; display: flex; flex-direction: column; flex: 1;">
  <h1 style="font-size: 30pt; color: ${C.text}; margin: 0 0 22pt 0; font-weight: bold;">AI+OPC = 一人公司</h1>
  <div style="display: flex; gap: 30pt; flex: 1; align-items: center;">
    <div style="flex: 1; text-align: center;">
      <div style="background: ${C.cardLight}; border-radius: 8pt; padding: 25pt;">
        <p style="font-size: 14pt; color: ${C.textLight}; margin: 0 0 8pt 0;">传统模式</p>
        <p style="font-size: 40pt; color: ${C.textMid}; margin: 0;">△</p>
        <p style="font-size: 12pt; color: ${C.textLight}; margin: 6pt 0 0 0;">层级 · 协调 · 管理</p>
      </div>
    </div>
    <div style="text-align: center;">
      <p style="font-size: 28pt; color: ${C.text}; margin: 0; font-weight: bold;">→</p>
    </div>
    <div style="flex: 1; text-align: center;">
      <div style="background: ${C.text}; border-radius: 8pt; padding: 25pt;">
        <p style="font-size: 14pt; color: rgba(255,255,255,0.6); margin: 0 0 8pt 0;">AI原生模式</p>
        <p style="font-size: 40pt; color: ${C.white}; margin: 0;">◉</p>
        <p style="font-size: 12pt; color: rgba(255,255,255,0.5); margin: 6pt 0 0 0;">一人 + AI Agent 网络</p>
      </div>
    </div>
  </div>
  <div style="margin-top: 16pt; border-top: 1pt solid ${C.divider}; padding-top: 14pt;">
    <p style="font-size: 15pt; color: ${C.text}; margin: 0; text-align: center;">两年内，中国将出现第一批<span style="font-weight: bold;">年收入千万的一人公司</span></p>
  </div>
</div>
`));

// P9 - 超级个体 ≠ 孤狼 (with AI generated conductor image)
slides.push(() => {
  const img = imgPath('p9-conductor.png');
  const imgHtml = img ? `<div style="position: absolute; top: 0; left: 0; width: 720pt; height: 405pt; overflow: hidden;"><img src="${img}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.2;"></div>` : '';
  return warmSlide(`
<div style="position: relative; flex: 1; display: flex; flex-direction: column;">
  ${imgHtml}
  <div style="margin: 55pt 60pt; display: flex; flex-direction: column; flex: 1; justify-content: center; position: relative; z-index: 1;">
    <h1 style="font-size: 34pt; color: ${C.text}; margin: 0 0 16pt 0; font-weight: bold;">超级个体不是一个人干十个人的活</h1>
    <div style="background: ${C.text}; width: 40pt; height: 2pt; margin: 0 0 16pt 0;"></div>
    <h1 style="font-size: 34pt; color: ${C.textMid}; margin: 0; font-weight: bold;">是一个人决定干什么活</h1>
  </div>
</div>`);
});

// P10 - 三层核心能力
slides.push(() => warmSlide(`
<div style="margin: 40pt 55pt; display: flex; flex-direction: column; flex: 1;">
  <h1 style="font-size: 28pt; color: ${C.text}; margin: 0 0 22pt 0; font-weight: bold;">超级个体的三层核心能力</h1>
  <div style="display: flex; flex-direction: column; gap: 12pt; flex: 1; justify-content: center;">
    <div style="display: flex; align-items: center; gap: 16pt;">
      <div style="background: ${C.text}; border-radius: 50%; width: 44pt; height: 44pt; display: flex; align-items: center; justify-content: center;">
        <p style="font-size: 20pt; color: ${C.white}; margin: 0; font-weight: bold;">①</p>
      </div>
      <div style="flex: 1; background: ${C.text}; border-radius: 8pt; padding: 16pt 20pt;">
        <p style="font-size: 18pt; color: ${C.white}; margin: 0; font-weight: bold;">需求洞察</p>
        <p style="font-size: 12pt; color: rgba(255,255,255,0.6); margin: 4pt 0 0 0;">找到"特别需要但自己做太折腾"的交叉点</p>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 16pt;">
      <div style="background: ${C.textMid}; border-radius: 50%; width: 44pt; height: 44pt; display: flex; align-items: center; justify-content: center;">
        <p style="font-size: 20pt; color: ${C.white}; margin: 0; font-weight: bold;">②</p>
      </div>
      <div style="flex: 1; background: ${C.cardLight}; border-radius: 8pt; padding: 16pt 20pt;">
        <p style="font-size: 18pt; color: ${C.text}; margin: 0; font-weight: bold;">迭代速度</p>
        <p style="font-size: 12pt; color: ${C.textLight}; margin: 4pt 0 0 0;">向AI清晰描述需求，快速跑通闭环</p>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 16pt;">
      <div style="background: ${C.textLight}; border-radius: 50%; width: 44pt; height: 44pt; display: flex; align-items: center; justify-content: center;">
        <p style="font-size: 20pt; color: ${C.white}; margin: 0; font-weight: bold;">③</p>
      </div>
      <div style="flex: 1; background: ${C.cardLight}; border-radius: 8pt; padding: 16pt 20pt;">
        <p style="font-size: 18pt; color: ${C.text}; margin: 0; font-weight: bold;">增长叙事</p>
        <p style="font-size: 12pt; color: ${C.textLight}; margin: 4pt 0 0 0;">Building in Public，被看见</p>
      </div>
    </div>
  </div>
</div>
`));

// P11 - 你的行业经验才是护城河
slides.push(() => warmSlide(`
<div style="margin: 55pt 60pt; display: flex; flex-direction: column; flex: 1; justify-content: center;">
  <h1 style="font-size: 36pt; color: ${C.text}; margin: 0 0 20pt 0; line-height: 1.3; font-weight: bold;">AI什么都会做<br>但不知道什么值得做</h1>
  <div style="background: ${C.text}; width: 40pt; height: 2pt; margin: 0 0 20pt 0;"></div>
  <p style="font-size: 18pt; color: ${C.textMid}; margin: 0; line-height: 1.6;">你20年的行业直觉，是AI最缺的东西</p>
</div>
`));

// P12 - 金字塔从腰部断裂 (WARM)
slides.push(() => warmSlide(`
<div style="margin: 50pt 60pt; display: flex; flex-direction: column; flex: 1; justify-content: center;">
  <p style="font-size: 12pt; color: ${C.textLight}; margin: 0 0 16pt 0; letter-spacing: 2pt;">被忽视的真相</p>
  <h1 style="font-size: 38pt; color: ${C.text}; margin: 0 0 30pt 0; line-height: 1.3; font-weight: bold;">AI冲击最大的不是底层<br><span style="color: #C0392B;">是中层</span></h1>
  <div style="display: flex; align-items: flex-end; gap: 0; margin-bottom: 20pt;">
    <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
      <div style="background: ${C.cardLight}; width: 80pt; height: 40pt; border-radius: 4pt 4pt 0 0; display: flex; align-items: center; justify-content: center;">
        <p style="font-size: 11pt; color: ${C.text}; margin: 0;">决策层</p>
      </div>
      <div style="background: #C0392B; width: 140pt; height: 50pt; display: flex; align-items: center; justify-content: center; border: 2pt dashed ${C.text};">
        <p style="font-size: 12pt; color: ${C.white}; margin: 0; font-weight: bold;">协调层 · 断裂带</p>
      </div>
      <div style="background: ${C.divider}; width: 200pt; height: 50pt; border-radius: 0 0 4pt 4pt; display: flex; align-items: center; justify-content: center;">
        <p style="font-size: 11pt; color: ${C.textLight}; margin: 0;">执行层</p>
      </div>
    </div>
    <div style="flex: 1; padding-left: 30pt;">
      <p style="font-size: 13pt; color: ${C.text}; margin: 0 0 10pt 0;">项目经理 · 总监 · VP</p>
      <p style="font-size: 13pt; color: ${C.textMid}; margin: 0;">AI调度50个Agent<br>比你管50个人更高效</p>
    </div>
  </div>
</div>
`));

// P13 - 转场：张绍卿的故事
slides.push(() => warmSlide(`
<div style="margin: 60pt; display: flex; flex-direction: column; flex: 1; justify-content: center; align-items: center;">
  <p style="font-size: 12pt; color: ${C.textLight}; margin: 0 0 20pt 0; letter-spacing: 2pt;">一个真实故事</p>
  <h1 style="font-size: 36pt; color: ${C.text}; margin: 0; text-align: center; line-height: 1.4; font-weight: bold;">如果14岁的普通初中生可以…</h1>
</div>
`));

// P14 - 7天黑客松→四个产品
slides.push(() => warmSlide(`
<div style="margin: 40pt 50pt; display: flex; flex-direction: column; flex: 1;">
  <h1 style="font-size: 26pt; color: ${C.text}; margin: 0 0 6pt 0; font-weight: bold;">7天黑客松 → 四个产品</h1>
  <p style="font-size: 12pt; color: ${C.textLight}; margin: 0 0 18pt 0;">张绍卿，14岁，无锡，普通初中生</p>
  <div style="display: flex; gap: 10pt; flex: 1;">
    <div style="flex: 1; background: ${C.cardLight}; border-radius: 8pt; padding: 14pt; display: flex; flex-direction: column; border-top: 3pt solid ${C.text};">
      <p style="font-size: 11pt; color: ${C.textLight}; margin: 0 0 6pt 0;">黑客松</p>
      <p style="font-size: 16pt; color: ${C.text}; margin: 0 0 8pt 0; font-weight: bold;">智能药箱</p>
      <p style="font-size: 10pt; color: ${C.textLight}; margin: 0;">首个产品<br>AI写代码，他当产品经理</p>
    </div>
    <div style="flex: 1; background: ${C.cardLight}; border-radius: 8pt; padding: 14pt; display: flex; flex-direction: column; border-top: 3pt solid ${C.text};">
      <p style="font-size: 11pt; color: ${C.textLight}; margin: 0 0 6pt 0;">回校后</p>
      <p style="font-size: 16pt; color: ${C.text}; margin: 0 0 8pt 0; font-weight: bold;">作业管理系统</p>
      <p style="font-size: 10pt; color: ${C.textLight}; margin: 0;">全年级使用<br>PK排行榜 + 积分激励</p>
    </div>
    <div style="flex: 1; background: ${C.cardLight}; border-radius: 8pt; padding: 14pt; display: flex; flex-direction: column; border-top: 3pt solid ${C.text};">
      <p style="font-size: 11pt; color: ${C.textLight}; margin: 0 0 6pt 0;">持续迭代</p>
      <p style="font-size: 16pt; color: ${C.text}; margin: 0 0 8pt 0; font-weight: bold;">校园二手平台</p>
      <p style="font-size: 10pt; color: ${C.textLight}; margin: 0;">义卖捐图书馆<br>完整商业闭环</p>
    </div>
    <div style="flex: 1; background: ${C.text}; border-radius: 8pt; padding: 14pt; display: flex; flex-direction: column; border-top: 3pt solid ${C.warmWhite};">
      <p style="font-size: 11pt; color: rgba(255,255,255,0.5); margin: 0 0 6pt 0;">游戏化</p>
      <p style="font-size: 16pt; color: ${C.white}; margin: 0 0 8pt 0; font-weight: bold;">单词通</p>
      <p style="font-size: 10pt; color: rgba(255,255,255,0.5); margin: 0;">学校走正式采购流程<br>教务主任认可</p>
    </div>
  </div>
</div>
`));

// P15 - 闭环能力
slides.push(() => warmSlide(`
<div style="margin: 45pt 55pt; display: flex; flex-direction: column; flex: 1;">
  <h1 style="font-size: 28pt; color: ${C.text}; margin: 0 0 22pt 0; font-weight: bold;">闭环能力 = 超级个体的最小单位</h1>
  <div style="display: flex; flex: 1; align-items: center; justify-content: center;">
    <div style="display: flex; gap: 8pt; align-items: center;">
      <div style="background: ${C.text}; border-radius: 8pt; padding: 18pt 16pt; text-align: center; width: 100pt;">
        <p style="font-size: 14pt; color: ${C.warmWhite}; margin: 0; font-weight: bold;">发现问题</p>
        <p style="font-size: 10pt; color: rgba(255,255,255,0.5); margin: 4pt 0 0 0;">行业直觉</p>
      </div>
      <p style="font-size: 20pt; color: ${C.text}; margin: 0;">→</p>
      <div style="background: ${C.text}; border-radius: 8pt; padding: 18pt 16pt; text-align: center; width: 100pt;">
        <p style="font-size: 14pt; color: ${C.warmWhite}; margin: 0; font-weight: bold;">AI执行</p>
        <p style="font-size: 10pt; color: rgba(255,255,255,0.5); margin: 4pt 0 0 0;">快速实现</p>
      </div>
      <p style="font-size: 20pt; color: ${C.text}; margin: 0;">→</p>
      <div style="background: ${C.text}; border-radius: 8pt; padding: 18pt 16pt; text-align: center; width: 100pt;">
        <p style="font-size: 14pt; color: ${C.warmWhite}; margin: 0; font-weight: bold;">真实用户</p>
        <p style="font-size: 10pt; color: rgba(255,255,255,0.5); margin: 4pt 0 0 0;">验证价值</p>
      </div>
      <p style="font-size: 20pt; color: ${C.text}; margin: 0;">→</p>
      <div style="background: ${C.textMid}; border-radius: 8pt; padding: 18pt 16pt; text-align: center; width: 100pt;">
        <p style="font-size: 14pt; color: ${C.white}; margin: 0; font-weight: bold;">反馈迭代</p>
        <p style="font-size: 10pt; color: rgba(255,255,255,0.7); margin: 4pt 0 0 0;">循环上升</p>
      </div>
    </div>
  </div>
  <div style="border-top: 1pt solid ${C.divider}; padding-top: 14pt;">
    <p style="font-size: 16pt; color: ${C.text}; margin: 0; text-align: center;">你的行业经验比他多20年，你差的只是那个<span style="font-weight: bold;">"开始"</span></p>
  </div>
</div>
`));

// P16 - 意义感 (with AI generated lake image)
slides.push(() => {
  const img = imgPath('p16-lake.png');
  const imgHtml = img ? `<div style="position: absolute; top: 0; left: 0; width: 720pt; height: 405pt; overflow: hidden;"><img src="${img}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.18;"></div>` : '';
  return warmSlide(`
<div style="position: relative; flex: 1; display: flex; flex-direction: column;">
  ${imgHtml}
  <div style="margin: 60pt; display: flex; flex-direction: column; flex: 1; justify-content: center; position: relative; z-index: 1;">
    <h1 style="font-size: 36pt; color: ${C.text}; margin: 0 0 24pt 0; line-height: 1.3; font-weight: bold;">当所有人都能高效<br>高效就不是竞争力</h1>
    <div style="background: ${C.text}; width: 40pt; height: 2pt; margin: 0 0 20pt 0;"></div>
    <p style="font-size: 16pt; color: ${C.textMid}; margin: 0; line-height: 1.7;">AI时代的真正威胁不是失业<br>是"有能力但空虚"</p>
  </div>
</div>`);
});

// P17 - 三种不可替代
slides.push(() => warmSlide(`
<div style="margin: 38pt 50pt 42pt 50pt; display: flex; flex-direction: column; flex: 1;">
  <h1 style="font-size: 26pt; color: ${C.text}; margin: 0 0 16pt 0; font-weight: bold;">AI永远替代不了的三样东西</h1>
  <div style="display: flex; gap: 14pt; flex: 1;">
    <div style="flex: 1; background: ${C.cardLight}; border-radius: 10pt; padding: 18pt; display: flex; flex-direction: column; align-items: center; text-align: center; border-bottom: 3pt solid ${C.text};">
      <p style="font-size: 28pt; color: ${C.text}; margin: 0 0 8pt 0;">◆</p>
      <p style="font-size: 20pt; color: ${C.text}; margin: 0 0 8pt 0; font-weight: bold;">品味</p>
      <p style="font-size: 12pt; color: ${C.textLight}; margin: 0; line-height: 1.4;">判断什么值得做</p>
    </div>
    <div style="flex: 1; background: ${C.cardLight}; border-radius: 10pt; padding: 18pt; display: flex; flex-direction: column; align-items: center; text-align: center; border-bottom: 3pt solid ${C.text};">
      <p style="font-size: 28pt; color: ${C.text}; margin: 0 0 8pt 0;">◎</p>
      <p style="font-size: 20pt; color: ${C.text}; margin: 0 0 8pt 0; font-weight: bold;">愿力</p>
      <p style="font-size: 12pt; color: ${C.textLight}; margin: 0; line-height: 1.4;">决定成为谁</p>
    </div>
    <div style="flex: 1; background: ${C.cardLight}; border-radius: 10pt; padding: 18pt; display: flex; flex-direction: column; align-items: center; text-align: center; border-bottom: 3pt solid ${C.text};">
      <p style="font-size: 28pt; color: ${C.text}; margin: 0 0 8pt 0;">✦</p>
      <p style="font-size: 20pt; color: ${C.text}; margin: 0 0 8pt 0; font-weight: bold;">意义建构</p>
      <p style="font-size: 12pt; color: ${C.textLight}; margin: 0; line-height: 1.4;">为自己和他人讲故事</p>
    </div>
  </div>
  <div style="margin-top: 12pt; padding-top: 10pt; border-top: 1pt solid ${C.divider};">
    <p style="font-size: 15pt; color: ${C.textMid}; margin: 0; text-align: center;">AI能做一切，除了告诉你<span style="color: ${C.text}; font-weight: bold;">什么值得做</span></p>
  </div>
</div>
`));

// P18 - 人变少了，但人变回来了 (DARK)
slides.push(() => darkSlide(`
<div style="margin: 50pt 60pt; display: flex; flex-direction: column; flex: 1; justify-content: center; align-items: center;">
  <div style="display: flex; align-items: baseline; gap: 20pt; margin-bottom: 28pt;">
    <h1 style="font-size: 72pt; color: rgba(255,255,255,0.3); margin: 0; font-weight: bold;">900</h1>
    <p style="font-size: 30pt; color: rgba(255,255,255,0.3); margin: 0;">→</p>
    <h1 style="font-size: 64pt; color: rgba(255,255,255,0.4); margin: 0; font-weight: bold;">80</h1>
    <p style="font-size: 30pt; color: rgba(255,255,255,0.3); margin: 0;">→</p>
    <h1 style="font-size: 56pt; color: rgba(255,255,255,0.5); margin: 0; font-weight: bold;">12</h1>
    <p style="font-size: 30pt; color: rgba(255,255,255,0.3); margin: 0;">→</p>
    <h1 style="font-size: 48pt; color: ${C.warmWhite}; margin: 0; font-weight: bold;">3</h1>
  </div>
  <div style="background: rgba(255,255,255,0.15); width: 40pt; height: 2pt; margin: 0 0 24pt 0;"></div>
  <h1 style="font-size: 32pt; color: ${C.white}; margin: 0; text-align: center; line-height: 1.4; font-weight: bold;">人变少了，但人变回来了</h1>
  <p style="font-size: 14pt; color: rgba(255,255,255,0.5); margin: 16pt 0 0 0; text-align: center;">数字在变小，但每一次我离自己想做的事更近了</p>
</div>
`));

// P19 - 递归问题 (DARK)
slides.push(() => darkSlide(`
<div style="margin: 60pt 70pt; display: flex; flex-direction: column; flex: 1; justify-content: center; align-items: center;">
  <p style="font-size: 20pt; color: rgba(255,255,255,0.6); margin: 0 0 24pt 0; text-align: center;">基于你此刻的全部认知——</p>
  <h1 style="font-size: 34pt; color: ${C.white}; margin: 0; text-align: center; line-height: 1.5; font-weight: bold;">最应该存在<br>但还不存在的东西<br>是什么？</h1>
</div>
`));

// P20 - 封底 (with AI generated open door image)
slides.push(() => {
  const img = imgPath('p20-open-door.png');
  const imgHtml = img ? `<div style="position: absolute; top: 0; left: 0; width: 720pt; height: 405pt; overflow: hidden;"><img src="${img}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.2;"></div>` : '';
  return warmSlide(`
<div style="position: relative; flex: 1; display: flex; flex-direction: column;">
  ${imgHtml}
  <div style="margin: 60pt; display: flex; flex-direction: column; flex: 1; justify-content: center; align-items: center; position: relative; z-index: 1;">
    <div style="background: ${C.text}; width: 40pt; height: 2pt; margin: 0 0 20pt 0;"></div>
    <h1 style="font-size: 30pt; color: ${C.text}; margin: 0 0 6pt 0; font-weight: bold;">王佳梁</h1>
    <p style="font-size: 14pt; color: ${C.text}; margin: 0 0 24pt 0;">超脑AI孵化器 · 创始人</p>
    <div style="background: ${C.text}; width: 1pt; height: 30pt; margin-bottom: 24pt;"></div>
    <p style="font-size: 14pt; color: ${C.text}; margin: 0; text-align: center; line-height: 1.6;">别问AI能为你做什么<br>问你自己：<span style="font-weight: bold;">什么问题值得你和AI一起解？</span></p>
  </div>
</div>`);
});

// === Build ===
async function build() {
  console.log('Creating gradient assets...');
  await createGradients();

  fs.mkdirSync(SLIDES_DIR, { recursive: true });
  console.log('Writing HTML slides...');
  for (let i = 0; i < slides.length; i++) {
    const html = typeof slides[i] === 'function' ? slides[i]() : slides[i];
    fs.writeFileSync(path.join(SLIDES_DIR, `slide-${String(i + 1).padStart(2, '0')}.html`), html);
  }

  console.log('Converting to PPTX...');
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = '王佳梁';
  pptx.title = 'AI+OPC：带给每个人的创新机遇';

  for (let i = 0; i < slides.length; i++) {
    const htmlFile = path.join(SLIDES_DIR, `slide-${String(i + 1).padStart(2, '0')}.html`);
    console.log(`  Slide ${i + 1}/20...`);
    await html2pptx(htmlFile, pptx);
  }

  fs.mkdirSync(path.join(__dirname, 'output'), { recursive: true });
  await pptx.writeFile({ fileName: OUTPUT });
  console.log(`\nDone! Output: ${OUTPUT}`);
}

build().catch(err => { console.error('Build failed:', err); process.exit(1); });
