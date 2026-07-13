//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the breath vessel in this instant, revealing
 * its focused js render v3 character animation idle service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — breath: the quiet proof the mannequin has died. */
import { add } from '../../CharacterRig.js';
import { wave } from '../Math.js';
/**
 * Reveals the breath behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} guard The guard value entering this behavior.
 */
export function breath(p, f, guard = false) {
	const b = wave(f, 0.045),
		face = p.face;
	p.chest = add(p.chest, face * (guard ? 3 : 1), b * -2);
	p.pelvis = add(p.pelvis, -face * (guard ? 2 : 0), b);
	p.head = add(p.head, face * (guard ? 4 : 1), b * -2);
	return p;
}
