//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the base launch vessel in this instant, revealing
 * its focused js render v3 character animation launch service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — ordinary launch stretch, the straight line after impact. */
import { add } from '../../CharacterRig.js';

/**
 * Reveals the base launch behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 */
export function baseLaunch(p, x, y) {
	p.chest = add(p.chest, x * 20, y * 13);
	p.head = add(p.head, x * 28, y * 10 - 8);
	p.leftHand = add(p.leftHand, x * 38, -22);
	p.rightHand = add(p.rightHand, x * 42, -26);
	p.leftFoot = add(p.leftFoot, -x * 18, 18);
	p.rightFoot = add(p.rightFoot, -x * 22, 20);
	return p;
}
