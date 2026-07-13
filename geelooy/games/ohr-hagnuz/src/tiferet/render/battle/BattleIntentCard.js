// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BattleIntentCard.js
 * @description Draws the exact next enemy intention with words and symbols.
 *
 * Warning becomes mercy when it is readable. The Awtsmoos creates concealed
 * depth without requiring concealed arithmetic; this card reveals target,
 * force, and response while mystery keeps its proper dignity at Awtsmoos.com.
 */
import { State } from '../../../binah/State.js';
import { roundRect } from './BattleCards.js';
import { BATTLE_THEME as T } from './BattleTheme.js';

const fit = (value = '', max = 42) => value.length > max ? `${value.slice(0, max - 1)}…` : value;

const write = (ctx, value, x, y, size, color, align = 'left') => {
	ctx.fillStyle = color;
	ctx.font = `850 ${size}px ${T.fonts.ui}`;
	ctx.textAlign = align;
	ctx.fillText(value, x, y);
};

export const drawBattleIntentCard = (ctx, layout) => {
	const intent = State.Debate.intent;
	if (!intent) return;
	const width = Math.min(layout.stage.w - 24, 330);
	const height = 62;
	const x = layout.stage.x + (layout.stage.w - width) / 2;
	const y = layout.stage.y + 8;
	ctx.save();
	ctx.fillStyle = 'rgba(5,7,18,.92)';
	ctx.strokeStyle = intent.kind === 'charge' ? '#ffd166' : '#80d8ff';
	ctx.lineWidth = 2;
	ctx.shadowColor = ctx.strokeStyle;
	ctx.shadowBlur = intent.kind === 'charge' ? 16 : 7;
	roundRect(ctx, x, y, width, height, 15);
	ctx.shadowBlur = 0;
	write(ctx, intent.icon, x + 17, y + 27, 22, ctx.strokeStyle);
	write(ctx, `NEXT · ${fit(intent.name, 27)}`, x + 48, y + 22, 13, '#fffde7');
	const damage = intent.rawDamage > 0 ? `${intent.rawDamage} light` : intent.kind;
	write(ctx, `${intent.target} · ${damage}`, x + 48, y + 41, 11, '#b0bec5');
	write(ctx, `Counter: ${fit(intent.counterTags.join(' / '), 27)}`, x + 48, y + 56, 10, '#ffe082');
	ctx.restore();
};
