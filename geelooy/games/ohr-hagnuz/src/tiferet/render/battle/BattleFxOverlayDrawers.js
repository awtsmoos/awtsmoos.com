/** B"H @module BattleFxOverlayDrawers - floating consequences and reward revelation. */
import { effectProgress } from './BattleFxGeometry.js';
import { drawFloatingNumber } from './BattleFxPrimitives.js';

export const drawConsequence = (ctx, effect) => drawFloatingNumber(ctx, effect);

export const drawReward = (ctx, effect) => {
	const width = ctx.canvas?.width || 390;
	const height = ctx.canvas?.height || 844;
	const progress = effectProgress(effect);
	ctx.save();
	ctx.globalAlpha = Math.min(1, effect.ttl / 16);
	ctx.fillStyle = 'rgba(8,10,24,.94)';
	ctx.strokeStyle = '#ffd966';
	ctx.lineWidth = 3;
	ctx.fillRect(width * 0.12, height * 0.45, width * 0.76, 86);
	ctx.strokeRect(width * 0.12, height * 0.45, width * 0.76, 86);
	ctx.textAlign = 'center';
	ctx.fillStyle = '#fffde7';
	ctx.font = '950 18px ui-rounded, system-ui';
	ctx.fillText('REWARDS', width / 2, height * 0.45 + 30);
	ctx.font = '750 12px ui-rounded, system-ui';
	ctx.fillText(String(effect.text || ''), width / 2, height * 0.45 + 58 + progress * 2);
	ctx.restore();
};
