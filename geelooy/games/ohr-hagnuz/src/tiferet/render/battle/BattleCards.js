/**
 * B"H
 * @module BattleCards
 *
 * Chapter 23: The Names Received Houses Of Glass.
 * The Awtsmoos has no body and no form; cards are boundaries of mercy, holding
 * light values, names, and glyphs so the player sees the battle at one glance.
 */
import { BATTLE_THEME as T } from './BattleTheme.js';

export const roundRect = (ctx, x, y, w, h, r = 12) => {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.stroke();
};

export const drawLightBar = (ctx, x, y, w, value, max, fill) => {
  const ratio = max ? Math.max(0, Math.min(1, value / max)) : 0;
  ctx.fillStyle = 'rgba(0,0,0,.58)'; ctx.fillRect(x, y, w, 18);
  ctx.strokeStyle = 'rgba(255,255,255,.42)'; ctx.strokeRect(x, y, w, 18);
  ctx.fillStyle = fill; ctx.fillRect(x + 3, y + 3, (w - 6) * ratio, 12);
  ctx.fillStyle = T.text; ctx.font = 'bold 12px monospace';
  ctx.fillText(`LIGHT ${value}/${max}`, x + 8, y + 3);
};

export const drawStatCard = (ctx, card) => {
  ctx.save();
  ctx.fillStyle = T.panel; ctx.strokeStyle = 'rgba(255,255,255,.34)'; ctx.lineWidth = 1.5;
  roundRect(ctx, card.x, card.y, card.w, card.h, 12);
  ctx.fillStyle = T.text; ctx.font = 'bold 18px monospace'; ctx.fillText(card.title, card.x + 18, card.y + 22);
  ctx.font = 'bold 15px monospace'; ctx.fillText(`Lv ${card.level}`, card.x + card.w - 62, card.y + 24);
  drawLightBar(ctx, card.x + 18, card.y + 48, card.w - 36, card.light, card.maxLight, card.fill);
  if (card.sub) { ctx.fillStyle = T.sub; ctx.font = '12px monospace'; ctx.fillText(card.sub, card.x + 18, card.y + 78); }
  ctx.restore();
};
