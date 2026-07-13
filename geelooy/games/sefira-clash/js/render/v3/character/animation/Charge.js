//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the charge vessel in this instant, revealing
 * its focused js render v3 character animation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — charge compresses the body until release becomes inevitable. */
import { add } from '../CharacterRig.js';
import { clamp, wave } from './Math.js';
/**
 * Reveals the charge behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function charge(p, f) {
	const face = p.face,
		c = clamp(f.chargeGlow || f.charge?.punch / 70 || f.charge?.kick / 70 || 0);
	const tremble = wave(f, 0.7) * c * 3;
	p.pelvis = add(p.pelvis, -face * 10 * c, 7 * c);
	p.chest = add(p.chest, -face * (18 * c + tremble), 5 * c);
	p.head = add(p.head, -face * (10 * c + tremble), 2 * c);
	p.leftHand = add(p.leftHand, -face * (26 + 12 * c), -30 * c);
	p.rightHand = add(p.rightHand, face * (26 + 12 * c), -30 * c);
	p.leftKnee = add(p.leftKnee, -face * 7 * c, -8 * c);
	p.rightKnee = add(p.rightKnee, face * 7 * c, -8 * c);
	return p;
}
