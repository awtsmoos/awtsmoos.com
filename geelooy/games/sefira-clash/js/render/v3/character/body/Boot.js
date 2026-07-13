//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the boot vessel in this instant, revealing
 * its focused js render v3 character body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — V3 boot, smaller planted foot. */
import { V3_STYLE } from '../CharacterStyle.js';
/**
 * Reveals the draw boot behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} foot The foot value entering this behavior.
 * @param {*} sign The sign value entering this behavior.
 * @param {*} mat The mat value entering this behavior.
 */
export function drawBoot(ctx, foot, sign, mat) {
	ctx.save();
	ctx.translate(foot.x, foot.y);
	ctx.rotate(sign * 0.04);
	ctx.fillStyle = mat.accent;
	ctx.strokeStyle = mat.ink;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.ellipse(sign * 3, 0, V3_STYLE.boot.rx, V3_STYLE.boot.ry, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.restore();
}
