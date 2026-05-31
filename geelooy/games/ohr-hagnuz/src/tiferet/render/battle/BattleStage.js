/**
 * B"H
 * @module BattleStage
 *
 * Chapter 30: The arena stopped being a box and became a sky under glass.
 * The Awtsmoos has no body and no form; this renderer paints only a hint of
 * depth, a midnight floor where choices can descend without stealing the soul
 * of the duel from the combatants.
 */
import { BATTLE_THEME as T } from './BattleTheme.js';

export const drawBattleStage = (ctx, layout) => {
  const c = T.colors;
  const bg = ctx.createLinearGradient(0, 0, 0, layout.h);
  bg.addColorStop(0, c.nightTop);
  bg.addColorStop(.48, c.nightMid);
  bg.addColorStop(1, c.nightLow);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, layout.w, layout.h);
  ctx.fillStyle = 'rgba(255,255,255,.035)';
  ctx.fillRect(layout.margin, layout.margin, layout.w - layout.margin * 2, layout.h - layout.margin * 2);
  ctx.strokeStyle = c.lineGold;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(layout.margin + .5, layout.margin + .5, layout.w - layout.margin * 2, layout.h - layout.margin * 2);
  drawFloorGrid(ctx, layout.stage);
  drawVsSeal(ctx, layout.vs);
};

const drawFloorGrid = (ctx, stage) => {
  ctx.save();
  ctx.strokeStyle = T.colors.grid;
  ctx.lineWidth = 1;
  const base = stage.y + stage.h * .55;
  for (let y = base; y < stage.y + stage.h; y += stage.h / 9) {
    ctx.beginPath();
    ctx.moveTo(stage.x + 8, y);
    ctx.lineTo(stage.x + stage.w - 8, y);
    ctx.stroke();
  }
  for (let x = stage.x + stage.w * .08; x < stage.x + stage.w; x += stage.w / 8) {
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.lineTo(x - stage.w * .11, stage.y + stage.h);
    ctx.stroke();
  }
  ctx.restore();
};

const drawVsSeal = (ctx, vs) => {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = T.colors.gold;
  ctx.shadowColor = T.glow.selected;
  ctx.shadowBlur = 24;
  ctx.font = `800 42px ${T.fonts.display}`;
  ctx.fillText('VS', vs.x, vs.y);
  ctx.shadowBlur = 0;
  ctx.font = `700 18px ${T.fonts.display}`;
  ctx.fillText('←  ◇  →', vs.x, vs.y + 25);
  ctx.restore();
};

export const drawAura = (ctx, x, y, radius, color) => {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(.48, color.replace('.72', '.24'));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
};
