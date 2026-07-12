/** B"H @module BattleFxPrimitives - reusable circles and floating labels. */
import { effectProgress, targetPoint } from './BattleFxGeometry.js';

export const strokeCircle = (ctx, x, y, radius, stroke, alpha = 1, width = 2) => {
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.strokeStyle = stroke;
	ctx.lineWidth = width;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.stroke();
	ctx.restore();
};

export const drawFloatingNumber = (ctx, effect) => {
	const point = targetPoint(ctx, effect.target);
	const progress = effectProgress(effect);
	ctx.save();
	ctx.globalAlpha = Math.min(1, effect.ttl / 12);
	ctx.textAlign = 'center';
	ctx.font = `950 ${28 + Math.sin(progress * Math.PI) * 10}px ui-rounded, system-ui`;
	ctx.lineWidth = 7;
	ctx.strokeStyle = 'rgba(0,0,0,.72)';
	ctx.fillStyle = effect.type === 'heal' ? '#b9f6ca' : '#fff176';
	const label = effect.type === 'heal' ? `+${effect.text}` : `−${effect.text}`;
	ctx.strokeText(label, point.x, point.y - 30 - progress * 65);
	ctx.fillText(label, point.x, point.y - 30 - progress * 65);
	ctx.restore();
};
