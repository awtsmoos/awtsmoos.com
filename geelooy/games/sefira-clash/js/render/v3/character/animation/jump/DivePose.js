//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the dive pose vessel in this instant, revealing
 * its focused js render v3 character animation jump service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — down-special dive becomes a spear. */
import { add } from '../../CharacterRig.js';
/**
 * Reveals the dive pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function divePose(p, f) {
	const face = p.face;
	p.chest = add(p.chest, face * 8, 10);
	p.head = add(p.head, face * 9, 12);
	p.leftHand = add(p.leftHand, -face * 8, 28);
	p.rightHand = add(p.rightHand, face * 8, 28);
	p.leftKnee = add(p.leftKnee, -face * 6, 18);
	p.rightKnee = add(p.rightKnee, face * 6, 18);
	p.leftFoot = add(p.leftFoot, -face * 4, 28);
	p.rightFoot = add(p.rightFoot, face * 4, 28);
	return p;
}
