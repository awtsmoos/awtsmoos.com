//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the apex hang vessel in this instant, revealing
 * its focused js render v3 character animation jump service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — apex hang, the half-second where gravity waits. */
import { add } from '../../CharacterRig.js';
import { wave } from '../Math.js';
/**
 * Reveals the apex hang behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function apexHang(p, f) {
	const face = p.face,
		float = wave(f, 0.09);
	p.chest = add(p.chest, face * 1, -5);
	p.head = add(p.head, face * float * 3, -8);
	p.leftHand = add(p.leftHand, -face * 25, -20 + float * 4);
	p.rightHand = add(p.rightHand, face * 25, -20 - float * 4);
	p.leftKnee = add(p.leftKnee, -face * 18, -9);
	p.rightKnee = add(p.rightKnee, face * 18, -9);
	p.leftFoot = add(p.leftFoot, -face * 16, -2);
	p.rightFoot = add(p.rightFoot, face * 16, -2);
	return p;
}
