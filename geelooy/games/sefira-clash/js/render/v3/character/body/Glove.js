//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the glove vessel in this instant, revealing
 * its focused js render v3 character body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — V3 glove, compact not blob. */
import { V3_STYLE } from '../CharacterStyle.js';
/**
 * Reveals the draw glove behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} h The h value entering this behavior.
 * @param {*} mat The mat value entering this behavior.
 */
export function drawGlove(ctx, h, mat) {
	ctx.save();
	ctx.translate(h.x, h.y);
	ctx.fillStyle = mat.accent;
	ctx.strokeStyle = mat.ink;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.ellipse(0, 0, V3_STYLE.glove.rx, V3_STYLE.glove.ry, -0.1, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.restore();
}
