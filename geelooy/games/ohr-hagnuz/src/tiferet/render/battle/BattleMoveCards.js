/**
 * B"H
 * @module BattleMoveCards
 *
 * Chapter 24: Four Answers Became Four Doors.
 * The Awtsmoos has no body and no form; each Torah response becomes a large
 * touchable card with icon, title, teaching, hotkey, and luminous border.
 */
import { MOVE_SKINS, BATTLE_THEME as T } from './BattleTheme.js';
import { roundRect } from './BattleCards.js';

const fit = (text, max) => text.length > max ? `${text.slice(0, max - 1)}…` : text;

export const drawMoveCard = (ctx, move, rect, chosen) => {
  const skin = MOVE_SKINS[rect.i] || MOVE_SKINS[0];
  ctx.save();
  ctx.fillStyle = chosen ? 'rgba(255,245,157,.22)' : 'rgba(18,22,36,.82)';
  ctx.strokeStyle = chosen ? skin.color : 'rgba(255,255,255,.24)';
  ctx.lineWidth = chosen ? 3 : 1.5;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fillStyle = `${skin.color}22`; ctx.strokeStyle = skin.color; ctx.lineWidth = 2;
  roundRect(ctx, rect.x + 12, rect.y + 10, 72, rect.h - 20, 10);
  ctx.fillStyle = skin.color; ctx.font = 'bold 34px monospace'; ctx.textAlign = 'center';
  ctx.fillText(skin.icon, rect.x + 48, rect.y + 28);
  ctx.textAlign = 'left'; ctx.fillStyle = T.text; ctx.font = 'bold 21px monospace';
  ctx.fillText(fit(move.name, 28), rect.x + 102, rect.y + 18);
  ctx.fillStyle = T.sub; ctx.font = '14px monospace'; ctx.fillText(skin.desc, rect.x + 102, rect.y + 48);
  ctx.fillStyle = T.text; ctx.font = 'bold 24px monospace'; ctx.textAlign = 'right';
  ctx.fillText(String(rect.i + 1), rect.x + rect.w - 26, rect.y + 30);
  ctx.restore();
};

export const drawMovePrompt = ctx => {
  ctx.save();
  ctx.fillStyle = 'rgba(5,7,18,.86)'; ctx.strokeStyle = 'rgba(255,255,255,.44)';
  roundRect(ctx, 250, 282, 300, 56, 12);
  ctx.fillStyle = T.text; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
  ctx.fillText('Choose a Torah response', 400, 302);
  ctx.fillStyle = T.sub; ctx.font = '12px monospace'; ctx.fillText('Use wisdom to reveal the light within.', 400, 322);
  ctx.restore();
};
