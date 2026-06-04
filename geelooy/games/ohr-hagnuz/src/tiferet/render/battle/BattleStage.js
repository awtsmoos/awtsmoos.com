/**
 * B"H
 * @module BattleStage
 * @description Dirty animated debate arena.
 *
 * Chapter 159: The floor became a storm of argument. The Awtsmoos has no body
 * and no form, yet the battlefield must feel like a living sugya: cracked grid,
 * moving nebula, pulsing sefiros, low smoke, and the VS seal beating like a
 * heart under the words of the learner.
 */
import { BATTLE_THEME as T } from './BattleTheme.js';

const TAU = Math.PI * 2;

/** @param {CanvasRenderingContext2D} ctx @param {object} layout @returns {void} */
export const drawBattleStage = (ctx, layout) => {
  const t = performance.now() * 0.001;
  drawSky(ctx, layout, t);
  drawPanel(ctx, layout, t);
  drawStarAsh(ctx, layout, t);
  drawFloorGrid(ctx, layout.stage, t);
  drawAuras(ctx, layout.stage, t);
  drawCracks(ctx, layout.stage, t);
  drawVsSeal(ctx, layout.vs, t);
  drawSmoke(ctx, layout.stage, t);
};

const drawSky = (ctx, layout, t) => {
  const g = ctx.createLinearGradient(0, 0, 0, layout.h);
  g.addColorStop(0, '#03040d');
  g.addColorStop(0.42, '#14071f');
  g.addColorStop(0.72, '#071421');
  g.addColorStop(1, '#020308');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, layout.w, layout.h);
  for (let i = 0; i < 7; i += 1) drawRibbon(ctx, layout, t, i);
};

const drawRibbon = (ctx, layout, t, i) => {
  const y = 34 + i * 46 + Math.sin(t * 1.7 + i) * 18;
  const x = (Math.sin(t * 0.7 + i * 2) * 0.5 + 0.5) * layout.w - layout.w * 0.18;
  const g = ctx.createLinearGradient(x, y, x + layout.w * 0.46, y + 24);
  g.addColorStop(0, 'rgba(255,241,118,0)');
  g.addColorStop(0.5, i % 2 ? 'rgba(157,124,255,.35)' : 'rgba(255,241,118,.32)');
  g.addColorStop(1, 'rgba(128,216,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, layout.w * 0.48, 4 + (i % 3));
};

const drawPanel = (ctx, layout, t) => {
  ctx.fillStyle = 'rgba(10,13,30,.74)';
  ctx.fillRect(layout.margin, layout.margin, layout.w - layout.margin * 2, layout.h - layout.margin * 2);
  ctx.strokeStyle = T.colors.lineGold;
  ctx.lineWidth = 1.5 + Math.sin(t * 4) * 0.5;
  ctx.strokeRect(layout.margin + 0.5, layout.margin + 0.5, layout.w - layout.margin * 2, layout.h - layout.margin * 2);
};

const drawStarAsh = (ctx, layout, t) => {
  ctx.save();
  ctx.globalAlpha = 0.55;
  for (let i = 0; i < 36; i += 1) {
    const x = ((i * 97 + t * 28) % (layout.w + 40)) - 20;
    const y = 40 + ((i * 53 + Math.sin(t + i) * 10) % (layout.stage.y + layout.stage.h * 0.8));
    ctx.fillStyle = i % 3 ? '#fff176' : '#80d8ff';
    ctx.fillRect(x, y, i % 4 === 0 ? 3 : 2, 2);
  }
  ctx.restore();
};

const drawFloorGrid = (ctx, stage, t) => {
  const base = stage.y + stage.h * 0.54;
  ctx.strokeStyle = 'rgba(157,112,255,.24)';
  ctx.lineWidth = 1.3;
  for (let y = base; y < stage.y + stage.h; y += stage.h / 10) line(ctx, stage.x + 8, y + Math.sin(t * 2 + y) * 3, stage.x + stage.w - 8, y);
  for (let x = stage.x + stage.w * 0.06; x < stage.x + stage.w; x += stage.w / 9) line(ctx, x, base, x - stage.w * 0.14, stage.y + stage.h);
};

const drawAuras = (ctx, stage, t) => {
  [['#80d8ff', 0.29], ['#ff5252', 0.71], ['#fff176', 0.5]].forEach(([color, ax], i) => {
    const x = stage.x + stage.w * ax;
    const y = stage.y + stage.h * (i === 2 ? 0.2 : 0.66 + Math.sin(t + i) * 0.02);
    const r = stage.w * (i === 2 ? 0.15 : 0.25 + Math.sin(t * 3 + i) * 0.02);
    const g = ctx.createRadialGradient(x, y, 5, x, y, r);
    g.addColorStop(0, `${color}66`);
    g.addColorStop(1, `${color}00`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  });
};

const drawCracks = (ctx, stage, t) => {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,241,118,.35)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i += 1) {
    const x = stage.x + stage.w * (0.18 + i * 0.09);
    const y = stage.y + stage.h * (0.67 + Math.sin(t + i) * 0.05);
    line(ctx, x, y, x + Math.sin(i) * 38, y + 18 + Math.cos(t + i) * 12);
  }
  ctx.restore();
};

const drawVsSeal = (ctx, vs, t) => {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.shadowColor = '#fff176';
  ctx.shadowBlur = 22;
  ctx.fillStyle = T.colors.gold;
  ctx.font = `900 ${Math.round(46 + Math.sin(t * 5) * 5)}px ${T.fonts.display}`;
  ctx.fillText('VS', vs.x, vs.y);
  ctx.shadowBlur = 0;
  ctx.font = `800 17px ${T.fonts.display}`;
  ctx.fillText('אמת  ◇  ספק', vs.x, vs.y + 27);
  ctx.restore();
};

const drawSmoke = (ctx, stage, t) => {
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#d7c8ff';
  for (let i = 0; i < 9; i += 1) {
    ctx.beginPath();
    ctx.ellipse(stage.x + stage.w * (i / 8), stage.y + stage.h * 0.9 + Math.sin(t + i) * 8, stage.w * 0.09, 10 + i % 3 * 4, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
};

const line = (ctx, x1, y1, x2, y2) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};
