//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the body archetype vessel in this instant, revealing
 * its focused js skeleton style service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos movement split vessel: visual-only readability, no gameplay authority.
 */
import { clamp } from '../poseMath.js';
/**
 * Reveals the body archetype behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 */
export function bodyArchetype(f) {
	const d = f.dna || {},
		h = clamp(d.height || 1, 0.85, 1.22),
		arm = clamp(d.arm || 1, 0.85, 1.18),
		leg = clamp(d.leg || 1, 0.85, 1.18),
		wide = (d.hue || 0) % 120 < 40 ? 1.08 : 0.96;
	return {
		kind: h > 1.12 ? 'tall' : h < 0.94 ? 'compact' : wide > 1 ? 'broad' : 'balanced',
		height: h,
		shoulderWidth: 31 * h * wide * (0.94 + arm * 0.08),
		hipWidth: 18 * h * (2 - wide * 0.65),
		torsoLength: 72 * h,
		headSize: 18 * h,
		handSize: 7 * arm,
		footSize: 11 * leg,
		limbThickness: 7 * (0.92 + h * 0.08),
		stanceWidth: 1 + (leg - 1) * 0.35
	};
}
