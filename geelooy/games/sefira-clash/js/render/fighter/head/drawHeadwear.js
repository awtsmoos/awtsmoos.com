//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw headwear vessel in this instant, revealing
 * its focused js render fighter head service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
import { drawDome, drawBrimHat, drawCap, drawCrown } from './headwearShapes.js';
/**
 * Reveals the draw headwear behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 * @param {*} color The color value entering this behavior.
 */
export function drawHeadwear(ctx, f, x, y, color) {
	const kind = f.cosmetic?.headwear || 'kippah';
	ctx.save();
	ctx.strokeStyle = '#050207';
	ctx.lineWidth = 4;
	ctx.fillStyle = color;
	if (kind === 'kippah' || kind === 'turban') drawDome(ctx, x, y, kind === 'turban' ? 17 : 13);
	else if (kind === 'blackhat') drawBrimHat(ctx, x, y, color, 40, 24);
	else if (kind === 'tophat') drawBrimHat(ctx, x, y, color, 46, 34);
	else if (kind === 'cap') drawCap(ctx, x, y, color);
	else if (kind === 'crown') drawCrown(ctx, x, y);
	else drawDome(ctx, x, y, 13);
	ctx.restore();
}
