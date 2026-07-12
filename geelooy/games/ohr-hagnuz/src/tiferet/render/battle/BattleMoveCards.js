/**
 * B"H
 * @module BattleMoveCards
 * @description Four direct move cards with power, affinity, and source text.
 *
 * The Awtsmoos is beyond every form, yet a player's choice must be visible.
 * Each card is now an action, not another hallway before the action.
 */
import { MOVE_SKINS, BATTLE_THEME as T } from './BattleTheme.js';
import { roundRect } from './BattleCards.js';

const fit = (value = '', max = 28) => value.length > max ? `${value.slice(0, max - 1)}…` : value;
const pulse = (index = 0) => Math.sin(performance.now() * 0.004 + index) * 0.5 + 0.5;
const write = (ctx, value, x, y, size, weight, color, align = 'left') => {
	ctx.fillStyle = color;
	ctx.font = `${weight} ${size}px ${T.fonts.ui}`;
	ctx.textAlign = align;
	ctx.fillText(value, x, y);
};

const drawShell = (ctx, rect, skin, chosen) => {
	ctx.save();
	ctx.shadowColor = chosen ? skin.color : 'transparent';
	ctx.shadowBlur = chosen ? 20 + pulse(rect.i) * 8 : 0;
	ctx.fillStyle = chosen ? '#17354a' : T.colors.glassStrong;
	ctx.strokeStyle = chosen ? skin.color : T.colors.line;
	ctx.lineWidth = chosen ? 3.2 : 1.2;
	roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 17);
	ctx.restore();
	ctx.fillStyle = skin.color;
	ctx.globalAlpha = chosen ? 0.9 : 0.36;
	ctx.fillRect(rect.x + 1, rect.y + 8, 5, rect.h - 16);
	ctx.globalAlpha = 1;
};

const drawIcon = (ctx, rect, skin, move, chosen) => {
	const size = Math.min(54, rect.h - 18);
	const x = rect.x + 12;
	const y = rect.y + (rect.h - size) / 2;
	ctx.fillStyle = '#050716';
	ctx.strokeStyle = skin.color;
	ctx.lineWidth = chosen ? 3 : 2;
	roundRect(ctx, x, y, size, size, 13);
	write(ctx, move?.category?.[0] || skin.icon, x + size / 2, y + size * 0.66, 24, 950, skin.color, 'center');
	return size;
};

export const drawMoveCard = (ctx, move, rect, chosen) => {
	const skin = MOVE_SKINS[rect.i] || MOVE_SKINS[0];
	drawShell(ctx, rect, skin, chosen);
	const iconSize = drawIcon(ctx, rect, skin, move, chosen);
	const x = rect.x + iconSize + 31;
	write(ctx, fit(move?.name || 'Unknown Move', 24), x, rect.y + rect.h * 0.3, 18, 950, T.colors.text);
	write(ctx, `${move?.category || 'Torah'} • Power ${move?.power || 0}${move?.heal ? ` • Heal ${move.heal}` : ''}`, x, rect.y + rect.h * 0.56, 12, 850, skin.color);
	write(ctx, fit(move?.routeQuote || move?.text || 'A revealed path of action.', 48), x, rect.y + rect.h * 0.8, 11, 700, T.colors.muted);
	write(ctx, String(rect.i + 1), rect.x + rect.w - 21, rect.y + rect.h * 0.58, 24, 950, chosen ? '#fff176' : T.colors.text, 'right');
};

export const drawMovePrompt = (ctx, rect) => {
	ctx.save();
	ctx.fillStyle = 'rgba(8,10,22,.94)';
	ctx.strokeStyle = 'rgba(255,241,118,.72)';
	ctx.lineWidth = 1.5;
	roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 16);
	ctx.restore();
	write(ctx, 'Choose one Torah move', rect.x + rect.w / 2, rect.y + rect.h * 0.42, 18, 950, T.colors.text, 'center');
	write(ctx, 'One press performs one complete action.', rect.x + rect.w / 2, rect.y + rect.h * 0.73, 11, 750, T.colors.muted, 'center');
};
