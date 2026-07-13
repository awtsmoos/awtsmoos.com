//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the leg masses vessel in this instant, revealing
 * its focused js render fighter hero body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Sculpted leg masses.
 *
 * Chapter 201: thighs and shins become strong black suit pieces, accented with
 * living color and ending in planted boots.
 */
import { heroSegment } from './segment.js';
import { MOCKUP } from '../converter/MockupMeasurements.js';
import { LEG_PARTS } from '../converter/HeroPartMap.js';

/**
 * Reveals the draw leg masses behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} mat The mat value entering this behavior.
 */
export function drawLegMasses(ctx, p, mat) {
	const s = p.scale || 1;
	for (const part of LEG_PARTS) {
		heroSegment(ctx, p[part.hip], p[part.knee], MOCKUP.legs.thighWidth * s, mat.accent, true);
		heroSegment(ctx, p[part.knee], p[part.foot], MOCKUP.legs.shinWidth * s, mat.accent, false);
	}
}
