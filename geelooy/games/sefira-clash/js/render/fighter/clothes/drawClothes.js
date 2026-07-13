//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw clothes vessel in this instant, revealing
 * its focused js render fighter clothes service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
import { drawRobe } from './drawRobe.js';
import { drawCoat } from './drawCoat.js';
import { drawScarf } from './drawScarf.js';
import { drawCapelet } from './drawCapelet.js';
import { drawSleeves } from './drawSleeves.js';
import { drawClothStrips } from './drawClothStrips.js';
/**
 * Reveals the draw clothes behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} color The color value entering this behavior.
 * @param {*} layer The layer value entering this behavior.
 */
export function drawClothes(ctx, f, color, layer = 'back') {
	const k = f.visualStyle?.clothing?.kind;
	if (!f.clothState || !k) return;
	if (layer === 'back') {
		if (k === 'capelet') drawCapelet(ctx, f, color);
		if (k === 'scarf') drawScarf(ctx, f, color);
		if (k === 'robe') drawRobe(ctx, f, color);
	} else {
		if (k === 'shortCoat' || k === 'tunic') drawCoat(ctx, f, color);
		if (k === 'strips') drawClothStrips(ctx, f, color);
		drawSleeves(ctx, f, color);
	}
}
