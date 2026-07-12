/**
 * B"H
 * @module BattleOverlay
 * @description Battle log, phase banners, busy prompt, and control hints.
 */
import { State } from '../../../binah/State.js';
import { BATTLE_THEME as T } from './BattleTheme.js';
import { roundRect } from './BattleCards.js';

const fit = (value = '', max = 72) => value.length > max ? `${value.slice(0, max - 1)}…` : value;
const write = (ctx, value, x, y, size, color, align = 'center') => {
	ctx.fillStyle = color;
	ctx.font = `800 ${size}px ${T.fonts.ui}`;
	ctx.textAlign = align;
	ctx.fillText(value, x, y);
};

export const drawBattleLog = (ctx, layout) => {
	const line = State.Debate.log?.[0];
	if (!line) return;
	const rect = { x: layout.margin * 1.4, y: layout.stage.y + layout.stage.h - 38, w: layout.w - layout.margin * 2.8, h: 30 };
	ctx.save();
	ctx.fillStyle = 'rgba(5,7,18,.82)';
	ctx.strokeStyle = 'rgba(255,241,118,.46)';
	roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
	write(ctx, fit(line, 64), rect.x + rect.w / 2, rect.y + 19, 11, '#fffde7');
	ctx.restore();
};

export const drawPhaseBanner = (ctx, layout, busy) => {
	if (!busy || !State.Debate.banner) return;
	const width = Math.min(layout.w - 50, 330);
	const x = (layout.w - width) / 2;
	const y = layout.stage.y + 112;
	ctx.save();
	ctx.fillStyle = 'rgba(6,8,18,.88)';
	ctx.strokeStyle = State.Debate.phase === 'reward' ? '#ffd966' : '#80d8ff';
	ctx.shadowColor = ctx.strokeStyle;
	ctx.shadowBlur = 14;
	roundRect(ctx, x, y, width, 50, 16);
	ctx.shadowBlur = 0;
	write(ctx, fit(State.Debate.banner, 44), layout.w / 2, y + 29, 14, '#fffde7');
	ctx.restore();
};

export const drawBusyPrompt = (ctx, layout) => {
	const rect = layout.prompt;
	ctx.save();
	ctx.fillStyle = 'rgba(5,7,18,.92)';
	ctx.strokeStyle = 'rgba(255,241,118,.55)';
	roundRect(ctx, rect.x, rect.y, rect.w, rect.h + 16, 14);
	const title = State.Debate.phase === 'reward' ? 'Rewards entering Bag' : 'The turn is unfolding…';
	write(ctx, title, rect.x + rect.w / 2, rect.y + 23, 17, '#ffe082');
	write(ctx, State.Debate.banner || 'Watch the impact', rect.x + rect.w / 2, rect.y + 45, 12, '#fffde7');
	ctx.restore();
};

export const drawBattleHints = (ctx, layout, busy) => {
	ctx.save();
	ctx.globalAlpha = 0.74;
	write(ctx, busy ? 'Input locked during animation' : 'B: Withdraw', layout.margin + 82, layout.footer.y + layout.footer.h * 0.55, 11, T.colors.muted);
	write(ctx, busy ? 'Turn resolving' : 'A: Use move', layout.w - layout.margin - 70, layout.footer.y + layout.footer.h * 0.55, 11, T.colors.muted);
	ctx.restore();
};
