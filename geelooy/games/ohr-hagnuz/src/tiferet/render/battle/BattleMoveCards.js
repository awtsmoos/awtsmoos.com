/**
 * B"H
 * @module BattleMoveCards
 * @description Dirty drill-down Torah cards with glow, quote emphasis, and depth.
 *
 * Chapter 162: The command cards became hot metal. The Awtsmoos has no body
 * and no form, yet the player's finger must feel the path: category, route,
 * chapter, quote. Cards now pulse, throw side-stripes, and make final quotes
 * look like ammunition instead of labels.
 */
import { MOVE_SKINS, BATTLE_THEME as T } from './BattleTheme.js';
import { roundRect } from './BattleCards.js';
import { State } from '../../../binah/State.js';
import { choicePrompt } from '../../../yesod/battle/TorahChoiceRuntime.js';

const fit = (value = '', max = 20) => value.length > max ? `${value.slice(0, max - 1)}…` : value;
const pulse = (i = 0) => Math.sin(performance.now() * 0.004 + i) * 0.5 + 0.5;
const text = (ctx, value, x, y, size, weight, color) => {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${T.fonts.ui}`;
  ctx.fillText(value, x, y);
};

/** @returns {void} */
export const drawMoveCard = (ctx, move, rect, chosen) => {
  const skin = MOVE_SKINS[rect.i] || MOVE_SKINS[0];
  const iconSize = Math.min(54, rect.h - 18);
  const p = pulse(rect.i);
  const titleSize = Math.max(15, Math.min(21, rect.h * 0.28));
  drawShell(ctx, rect, skin, chosen, move?.kind === 'quote', p);
  drawIconTile(ctx, rect, skin, iconSize, move, chosen, p);
  drawCopy(ctx, move, rect, skin, iconSize, titleSize);
  drawNumber(ctx, rect, chosen);
};

const drawShell = (ctx, rect, skin, chosen, quote, p) => {
  ctx.save();
  ctx.shadowColor = chosen ? skin.color : 'transparent';
  ctx.shadowBlur = chosen ? 18 + p * 10 : 0;
  ctx.fillStyle = chosen ? (quote ? '#5a4314' : '#17354a') : T.colors.glassStrong;
  ctx.strokeStyle = chosen ? skin.color : T.colors.line;
  ctx.lineWidth = chosen ? 3.3 : 1.2;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 17);
  ctx.restore();
  ctx.fillStyle = skin.color;
  ctx.globalAlpha = chosen ? 0.9 : 0.36;
  ctx.fillRect(rect.x + 1, rect.y + 8, 5, rect.h - 16);
  ctx.globalAlpha = 1;
};

const drawIconTile = (ctx, rect, skin, size, move, chosen, p) => {
  const x = rect.x + 12;
  const y = rect.y + (rect.h - size) / 2;
  ctx.fillStyle = '#050716';
  ctx.strokeStyle = skin.color;
  ctx.lineWidth = chosen ? 3 : 2;
  roundRect(ctx, x, y, size, size, 13);
  ctx.fillStyle = skin.color;
  ctx.shadowColor = skin.color;
  ctx.shadowBlur = chosen ? 14 + p * 8 : 0;
  ctx.font = `900 ${Math.round(size * (move?.kind === 'quote' ? 0.58 : 0.42))}px ${T.fonts.display}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(move?.kind === 'quote' ? '”' : skin.icon, x + size / 2, y + size / 2 + 1);
  ctx.shadowBlur = 0;
  ctx.textBaseline = 'alphabetic';
};

const drawCopy = (ctx, move, rect, skin, iconSize, titleSize) => {
  ctx.textAlign = 'left';
  const tx = rect.x + iconSize + 31;
  const title = move?.kind === 'quote' ? 'Use Quote' : move?.name || 'Torah Choice';
  text(ctx, fit(title, 24), tx, rect.y + rect.h * 0.3, titleSize, 950, T.colors.text);
  text(ctx, fit(move?.routeTitle || move?.category || 'Open next vessel', 38), tx, rect.y + rect.h * 0.55, 12, 850, skin.color);
  const quote = move?.kind === 'quote' ? `“${move?.name || move?.routeQuote}”` : move?.routeQuote || move?.text || 'Select to continue';
  text(ctx, fit(quote, 47), tx, rect.y + rect.h * 0.79, 11, move?.kind === 'quote' ? 850 : 650, move?.kind === 'quote' ? '#fff176' : T.colors.muted);
};

const drawNumber = (ctx, rect, chosen) => {
  ctx.textAlign = 'right';
  text(ctx, String(rect.i + 1), rect.x + rect.w - 21, rect.y + rect.h * 0.58, Math.min(28, rect.h * 0.38), 950, chosen ? '#fff176' : T.colors.text);
};

/** @returns {void} */
export const drawMovePrompt = (ctx, rect) => {
  const prompt = choicePrompt(State.Debate.choice);
  const p = pulse(9);
  ctx.save();
  ctx.shadowColor = '#fff176';
  ctx.shadowBlur = 8 + p * 12;
  ctx.fillStyle = 'rgba(8,10,22,.94)';
  ctx.strokeStyle = 'rgba(255,241,118,.72)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 16);
  ctx.restore();
  ctx.textAlign = 'center';
  text(ctx, prompt, rect.x + rect.w / 2, rect.y + rect.h * 0.4, Math.max(16, rect.h * 0.3), 950, T.colors.text);
  text(ctx, 'Category → Route → Chapter → Quote. Back reshapes the vessel.', rect.x + rect.w / 2, rect.y + rect.h * 0.72, Math.max(10, rect.h * 0.16), 750, T.colors.muted);
};
