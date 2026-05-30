/**
 * B"H
 * @module BattleStage
 *
 * Chapter 22: The Floor Became A Night Grid Under The Sparks.
 * The Awtsmoos has no body and no form; the arena is only a painted vessel,
 * a quiet geometry where choice can descend into pixels without clutter.
 */
import { BATTLE_THEME as T } from './BattleTheme.js';

export const drawBattleStage = ctx => {
  const g = ctx.createLinearGradient(0, 0, 800, 600);
  g.addColorStop(0, T.bgA); g.addColorStop(.48, T.bgB); g.addColorStop(1, T.bgC);
  ctx.fillStyle = g;
  ctx.fillRect(14, 14, 772, 572);
  ctx.strokeStyle = 'rgba(245,215,110,.76)';
  ctx.strokeRect(14.5, 14.5, 771, 571);
  ctx.strokeStyle = T.grid;
  for (let y = 250; y < 530; y += 28) { ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(740, y); ctx.stroke(); }
  for (let x = 80; x < 740; x += 56) { ctx.beginPath(); ctx.moveTo(x, 250); ctx.lineTo(x - 42, 530); ctx.stroke(); }
  ctx.fillStyle = T.gold;
  ctx.font = 'bold 40px serif';
  ctx.textAlign = 'center';
  ctx.fillText('VS', 400, 120);
  ctx.font = '18px serif';
  ctx.fillText('←  ◇  →', 400, 146);
  ctx.textAlign = 'left';
};

export const drawAura = (ctx, x, y, color) => {
  const g = ctx.createRadialGradient(x, y, 0, x, y, 92);
  g.addColorStop(0, color); g.addColorStop(.45, color.replace('.72', '.25')); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 92, 0, Math.PI * 2);
  ctx.fill();
};
