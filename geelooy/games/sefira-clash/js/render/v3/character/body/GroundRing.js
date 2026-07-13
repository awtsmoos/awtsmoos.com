//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the ground ring vessel in this instant, revealing
 * its focused js render v3 character body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — V3 ground ring. */
import { V3_STYLE } from '../CharacterStyle.js';
/**
 * Reveals the draw ground ring behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} color The color value entering this behavior.
 * @param {*} human The human value entering this behavior.
 */
export function drawGroundRing(ctx, p, color, human) {
	ctx.save();
	ctx.globalAlpha = human ? 0.75 : 0.32;
	ctx.strokeStyle = color;
	ctx.lineWidth = human ? 3 : 2;
	ctx.beginPath();
	ctx.ellipse(
		p.pelvis.x,
		Math.max(p.leftFoot.y, p.rightFoot.y) + 4,
		V3_STYLE.ring.rx,
		V3_STYLE.ring.ry,
		0,
		0,
		Math.PI * 2
	);
	ctx.stroke();
	ctx.restore();
}
