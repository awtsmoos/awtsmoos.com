//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the neck vessel in this instant, revealing
 * its focused js render v3 character body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — V3 attached neck. */
import { V3_STYLE } from '../CharacterStyle.js';
import { roundRect } from './Shape.js';
/**
 * Reveals the draw neck behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} mat The mat value entering this behavior.
 */
export function drawNeck(ctx, p, mat) {
	ctx.fillStyle = mat.shell;
	ctx.strokeStyle = mat.accent;
	ctx.lineWidth = 2;
	roundRect(
		ctx,
		p.neck.x - V3_STYLE.neck.w / 2,
		p.neck.y - 1,
		V3_STYLE.neck.w,
		V3_STYLE.neck.h,
		8
	);
	ctx.fill();
	ctx.stroke();
}
