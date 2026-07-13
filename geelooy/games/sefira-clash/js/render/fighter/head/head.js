//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the head vessel in this instant, revealing
 * its focused js render fighter head service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real head renderer orchestrator.
 *
 * Face, headwear, eye system, and expression are now separate visible vessels.
 */
import { drawFace } from './drawFace.js';
import { drawEye } from './drawEye.js';
import { drawHeadwear } from './drawHeadwear.js';
import { drawExpression } from './drawExpression.js';
/**
 * Reveals the draw head behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} color The color value entering this behavior.
 * @param {*} language The language value entering this behavior.
 */
export function drawHead(ctx, f, color, language) {
	const head = f.bones.head?.tip || { x: f.x, y: f.y - 170 };
	const x = head.x + (language.lean || 0) * 8;
	drawFace(ctx, f, x, head.y, color, language);
	drawHeadwear(ctx, f, x, head.y, color);
	drawEye(ctx, f, x, head.y, color, language);
	drawExpression(ctx, f, x, head.y, color, language);
}
