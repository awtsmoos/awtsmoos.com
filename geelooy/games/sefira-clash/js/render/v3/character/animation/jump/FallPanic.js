//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the fall panic vessel in this instant, revealing
 * its focused js render v3 character animation jump service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — falling silhouette: spread limbs, readable weight. */
import { add } from '../../CharacterRig.js';
import { clamp, wave } from '../Math.js';
/**
 * Reveals the fall panic behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} fast The fast value entering this behavior.
 */
export function fallPanic(p, f, fast = false) {
	const face = p.face,
		v = clamp((f.vy || 0) / 18),
		flutter = wave(f, 0.13) * (fast ? 1 : 4);
	p.chest = add(p.chest, face * (fast ? -4 : -2), v * (fast ? 5 : 3));
	p.head = add(p.head, face * flutter, v * (fast ? 3 : 1));
	p.leftHand = add(p.leftHand, -face * (fast ? 8 : 28), fast ? 8 : -15 + flutter);
	p.rightHand = add(p.rightHand, face * (fast ? 8 : 28), fast ? 8 : -15 - flutter);
	p.leftKnee = add(p.leftKnee, -face * (fast ? 7 : 18), fast ? 10 : -4);
	p.rightKnee = add(p.rightKnee, face * (fast ? 7 : 18), fast ? 10 : -4);
	p.leftFoot = add(p.leftFoot, -face * (fast ? 5 : 16), fast ? 8 : -1);
	p.rightFoot = add(p.rightFoot, face * (fast ? 5 : 16), fast ? 8 : -1);
	return p;
}
