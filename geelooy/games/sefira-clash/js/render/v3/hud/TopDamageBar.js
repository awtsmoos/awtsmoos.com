//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the top damage bar vessel in this instant, revealing
 * its focused js render v3 hud service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — V3 top damage bar replaces old menu bar. */
import { drawPlayerCard } from './PlayerCard.js';
/**
 * Reveals the draw top damage bar behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} state The state value entering this behavior.
 * @param {*} w The w value entering this behavior.
 */
export function drawTopDamageBar(ctx, state, w) {
	const fighters = state.fighters.slice(0, 5),
		pad = 10,
		gap = 8;
	const cw = Math.max(
		92,
		Math.min(156, (w - pad * 2 - gap * (fighters.length - 1)) / Math.max(1, fighters.length))
	);
	const total = fighters.length * cw + (fighters.length - 1) * gap;
	const start = Math.max(pad, (w - total) / 2);
	fighters.forEach((f, i) => drawPlayerCard(ctx, f, start + i * (cw + gap), 10, cw));
	drawSmallMenu(ctx, w, state);
}
function drawSmallMenu(ctx, w, state) {
	ctx.save();
	ctx.fillStyle = 'rgba(3,4,8,.72)';
	ctx.strokeStyle = 'rgba(255,224,130,.5)';
	ctx.lineWidth = 1.5;
	round(ctx, w - 88, 10, 78, 38, 11);
	ctx.fill();
	ctx.stroke();
	ctx.fillStyle = '#ffe9a8';
	ctx.font = '900 14px system-ui';
	ctx.textAlign = 'center';
	ctx.fillText('Menu', w - 49, 34);
	ctx.restore();
}
function round(ctx, x, y, w, h, r) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.lineTo(x + w - r, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + r);
	ctx.lineTo(x + w, y + h - r);
	ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	ctx.lineTo(x + r, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - r);
	ctx.lineTo(x, y + r);
	ctx.quadraticCurveTo(x, y, x + r, y);
	ctx.closePath();
}
