// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BattleMoveCards.js
 * @description Draws four direct commands with role, path, cost, and expected effect.
 *
 * A deep system need not hide behind a deep menu. The Awtsmoos creates every
 * layer while the hand still meets one clear choice; these cards show enough
 * truth to act without flooding the road with noise. Awtsmoos.com.
 */
import { roundRect } from './BattleCards.js';
import { BATTLE_THEME as T, MOVE_SKINS } from './BattleTheme.js';

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
	write(ctx, move?.role?.[0]?.toUpperCase() || skin.icon, x + size / 2, y + size * 0.66, 24, 950, skin.color, 'center');
	return size;
};

const effectLine = move => {
	if (move.role === 'guard') return `Guard ${Math.round((move.guardStrength || 0.5) * 100)}%`;
	if (move.role === 'study') return `Reveal intent · Power ${move.power || 0}`;
	if (move.role === 'companion') return `Assist ${move.power || 0}${move.heal ? ` · Heal ${move.heal}` : ''}`;
	return `Damage ${move.power || 0}${move.statusEffect ? ` · ${move.statusEffect}` : ''}`;
};

export const drawMoveCard = (ctx, move, rect, chosen) => {
	const skin = MOVE_SKINS[rect.i] || MOVE_SKINS[0];
	drawShell(ctx, rect, skin, chosen);
	const iconSize = drawIcon(ctx, rect, skin, move, chosen);
	const x = rect.x + iconSize + 31;
	write(ctx, fit(move?.name || 'Unknown Command', 24), x, rect.y + rect.h * 0.29, 18, 950, T.colors.text);
	write(ctx, `${move?.role?.toUpperCase() || 'ATTACK'} · ${move?.path || 'Pshat'} · Focus ${move?.focusCost || 0}`, x, rect.y + rect.h * 0.53, 11, 850, skin.color);
	write(ctx, fit(`${effectLine(move)} · ${move?.targetArea || 'single'}`, 45), x, rect.y + rect.h * 0.75, 11, 760, T.colors.muted);
	write(ctx, String(rect.i + 1), rect.x + rect.w - 21, rect.y + rect.h * 0.58, 24, 950, chosen ? '#fff176' : T.colors.text, 'right');
};

export const drawMovePrompt = (ctx, rect) => {
	ctx.save();
	ctx.fillStyle = 'rgba(8,10,22,.94)';
	ctx.strokeStyle = 'rgba(255,241,118,.72)';
	ctx.lineWidth = 1.5;
	roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 16);
	ctx.restore();
	write(ctx, 'Attack · Study · Guard · Companion', rect.x + rect.w / 2, rect.y + rect.h * 0.42, 17, 950, T.colors.text, 'center');
	write(ctx, 'Read the intent, then choose one complete action.', rect.x + rect.w / 2, rect.y + rect.h * 0.73, 11, 750, T.colors.muted, 'center');
};
