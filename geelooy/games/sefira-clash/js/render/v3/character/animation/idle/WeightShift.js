//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the weight shift vessel in this instant, revealing
 * its focused js render v3 character animation idle service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — weight moves in the feet so idle becomes a stance. */
import { add } from '../../CharacterRig.js';
import { wave } from '../Math.js';
/**
 * Reveals the weight shift behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} guard The guard value entering this behavior.
 */
export function weightShift(p, f, guard = false) {
	const face = p.face,
		s = wave(f, 0.028),
		ready = guard || f.nearEnemy;
	p.pelvis = add(p.pelvis, face * s * (ready ? 4 : 2), ready ? -1 : 0);
	p.leftKnee = add(p.leftKnee, -face * s * 3, ready ? -3 : 0);
	p.rightKnee = add(p.rightKnee, face * s * 3, ready ? -1 : 0);
	p.leftFoot = add(p.leftFoot, -face * s * (ready ? 4 : 1), 0);
	p.rightFoot = add(p.rightFoot, face * s * (ready ? 4 : 1), 0);
	return p;
}
