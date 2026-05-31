/**
 * B"H
 * @module BattleMoveCards
 *
 * Chapter 63: The four answers became premium command plates.
 * The Awtsmoos has no body and no form; these panels now breathe with gradient,
 * icon stone, selected bloom, and fitted text so mobile fingers feel a real RPG
 * choice instead of a flat debug menu.
 */
import { MOVE_SKINS, BATTLE_THEME as T } from './BattleTheme.js';
import { roundRect } from './BattleCards.js';

const fit = (value, max) => value.length > max ? `${value.slice(0, max - 1)}…` : value;

const drawText = (ctx, value, x, y, size, weight, color) => {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${T.fonts.ui}`;
  ctx.fillText(value, x, y);
};

const gradientFill = (ctx, rect, skin, chosen) => {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, chosen ? `${skin.color}46` : 'rgba(18,23,42,.94)');
  g.addColorStop(.62, chosen ? 'rgba(255,245,157,.2)' : 'rgba(9,12,28,.9)');
  g.addColorStop(1, chosen ? 'rgba(255,255,255,.1)' : 'rgba(6,8,18,.96)');
  return g;
};

export const drawMoveCard = (ctx, move, rect, chosen) => {
  const skin = MOVE_SKINS[rect.i] || MOVE_SKINS[0];
  const title = move?.name || skin.title;
  const iconSize = Math.min(56, rect.h - 18);
  const titleSize = Math.max(18, Math.min(23, rect.h * .32));
  const subSize = Math.max(11, Math.min(14, rect.h * .19));
  ctx.save();
  ctx.shadowColor = chosen ? skin.color : 'rgba(0,0,0,.55)';
  ctx.shadowBlur = chosen ? 24 : 10;
  ctx.fillStyle = gradientFill(ctx, rect, skin, chosen);
  ctx.strokeStyle = chosen ? skin.color : 'rgba(255,255,255,.2)';
  ctx.lineWidth = chosen ? 3 : 1.2;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 17);
  ctx.shadowBlur = 0;
  if (chosen) drawSelectedSheen(ctx, rect, skin);
  drawIconTile(ctx, rect, skin, iconSize, chosen);
  ctx.textAlign = 'left';
  const tx = rect.x + iconSize + 31;
  drawText(ctx, fit(title, 24), tx, rect.y + rect.h * .39, titleSize, 900, T.colors.text);
  drawText(ctx, fit(skin.desc, 38), tx, rect.y + rect.h * .7, subSize, 650, T.colors.muted);
  ctx.textAlign = 'right';
  drawText(ctx, String(rect.i + 1), rect.x + rect.w - 21, rect.y + rect.h * .6, Math.min(30, rect.h * .42), 900, T.colors.text);
  ctx.restore();
};

const drawSelectedSheen = (ctx, rect, skin) => {
  ctx.save();
  ctx.globalAlpha = .4;
  ctx.strokeStyle = skin.color;
  ctx.lineWidth = 1;
  ctx.strokeRect(rect.x + 7, rect.y + 7, rect.w - 14, rect.h - 14);
  ctx.globalAlpha = .18;
  ctx.fillStyle = '#fff';
  ctx.fillRect(rect.x + 12, rect.y + 6, rect.w * .5, 2);
  ctx.restore();
};

const drawIconTile = (ctx, rect, skin, size, chosen) => {
  const x = rect.x + 12;
  const y = rect.y + (rect.h - size) / 2;
  const g = ctx.createRadialGradient(x + size * .45, y + size * .35, 0, x + size / 2, y + size / 2, size * .72);
  g.addColorStop(0, chosen ? `${skin.color}52` : `${skin.color}30`);
  g.addColorStop(1, 'rgba(5,7,16,.8)');
  ctx.fillStyle = g;
  ctx.strokeStyle = skin.color;
  ctx.lineWidth = chosen ? 2.6 : 2;
  roundRect(ctx, x, y, size, size, 13);
  ctx.fillStyle = skin.color;
  ctx.shadowColor = skin.color;
  ctx.shadowBlur = chosen ? 12 : 4;
  ctx.font = `900 ${Math.round(size * .52)}px ${T.fonts.display}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(skin.icon, x + size / 2, y + size / 2 + 1);
  ctx.shadowBlur = 0;
  ctx.textBaseline = 'alphabetic';
};

export const drawMovePrompt = (ctx, rect) => {
  ctx.save();
  ctx.shadowColor = T.colors.shadow;
  ctx.shadowBlur = 16;
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  g.addColorStop(0, 'rgba(11,14,30,.94)');
  g.addColorStop(1, 'rgba(2,4,12,.94)');
  ctx.fillStyle = g;
  ctx.strokeStyle = T.colors.line;
  ctx.lineWidth = 1.2;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 16);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  drawText(ctx, 'Choose a Torah response', rect.x + rect.w / 2, rect.y + rect.h * .43, 17, 850, T.colors.text);
  drawText(ctx, 'Use wisdom to reveal the light within.', rect.x + rect.w / 2, rect.y + rect.h * .72, 12, 650, T.colors.muted);
  ctx.restore();
};
