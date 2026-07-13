//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the ground bounce vessel in this instant, revealing
 * its focused js render v3 character animation launch service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — ground bounce: the body splashes against the stage like thunder. */
import { add } from '../../CharacterRig.js';
import { wave } from '../Math.js';

/**
 * Reveals the ground bounce behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} x The x value entering this behavior.
 */
export function groundBounce(p, f, x) {
	const shiver = wave(f, 0.8) * 3;
	p.pelvis = add(p.pelvis, x * 3, 22);
	p.chest = add(p.chest, x * (8 + shiver), 30);
	p.head = add(p.head, x * (12 + shiver), 30);
	p.leftHand = add(p.leftHand, -x * 34, 28);
	p.rightHand = add(p.rightHand, x * 34, 28);
	p.leftFoot = add(p.leftFoot, -x * 32, 3);
	p.rightFoot = add(p.rightFoot, x * 32, 3);
	return p;
}
