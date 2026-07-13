//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the wall bounce vessel in this instant, revealing
 * its focused js render v3 character animation launch service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — wall bounce: the wall says no, and the spine hears it. */
import { add } from '../../CharacterRig.js';
import { wave } from '../Math.js';

/**
 * Reveals the wall bounce behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} x The x value entering this behavior.
 */
export function wallBounce(p, f, x) {
	const shiver = wave(f, 0.9) * 4;
	p.pelvis = add(p.pelvis, -x * 12, 8);
	p.chest = add(p.chest, -x * (26 + shiver), 5);
	p.head = add(p.head, -x * (34 + shiver), -4);
	p.leftHand = add(p.leftHand, x * 18, -24);
	p.rightHand = add(p.rightHand, x * 22, -10);
	p.leftFoot = add(p.leftFoot, -x * 36, 14);
	p.rightFoot = add(p.rightFoot, -x * 42, 24);
	return p;
}
