/**
 * B"H
 * @module BattleFxMotion
 * @description Auras, traveling letters, and impact rays.
 */
import { effectColor, effectProgress, easeOut, lerp, sourcePoint, targetPoint } from './BattleFxGeometry.js';
import { strokeCircle } from './BattleFxPrimitives.js';

export const drawAura = (ctx, effect) => {
	const point = targetPoint(ctx, effect.target);
	const progress = effectProgress(effect);
	const color = effectColor(effect);
	strokeCircle(ctx, point.x, point.y, 24 + progress * 34, color, 1 - progress * 0.7, 4);
	strokeCircle(ctx, point.x, point.y, 12 + progress * 24, '#ffffff', 0.6 - progress * 0.4, 2);
};

export const drawProjectile = (ctx, effect) => {
	const start = sourcePoint(ctx, effect.source || (effect.target === 'enemy' ? 'player' : 'enemy'));
	const end = targetPoint(ctx, effect.target);
	const progress = easeOut(effectProgress(effect));
	const color = effectColor(effect);
	for (let index = 5; index >= 0; index -= 1) {
		const trail = Math.max(0, progress - index * 0.035);
		const x = lerp(start.x, end.x, trail);
		const y = lerp(start.y, end.y, trail) - Math.sin(trail * Math.PI) * 42;
		ctx.fillStyle = color;
		ctx.globalAlpha = Math.max(0.08, 0.65 - index * 0.09);
		ctx.beginPath();
		ctx.arc(x, y, Math.max(2, 11 - index), 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.globalAlpha = 1;
	const x = lerp(start.x, end.x, progress);
	const y = lerp(start.y, end.y, progress) - Math.sin(progress * Math.PI) * 42;
	strokeCircle(ctx, x, y, 14, '#ffffff', 0.95, 3);
};

export const drawBurst = (ctx, effect) => {
	const point = targetPoint(ctx, effect.target);
	const progress = effectProgress(effect);
	ctx.save();
	ctx.translate(point.x, point.y);
	ctx.strokeStyle = effectColor(effect);
	ctx.lineWidth = 4;
	ctx.globalAlpha = 1 - progress;
	for (let index = 0; index < 14; index += 1) {
		const angle = index / 14 * Math.PI * 2;
		const inner = 12 + progress * 20;
		const outer = 34 + progress * 72;
		ctx.beginPath();
		ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
		ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
		ctx.stroke();
	}
	ctx.restore();
};
