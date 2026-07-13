//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the drop pose vessel in this instant, revealing
 * its focused js render v3 character animation ledge service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — ledge drop releases into a small fall curl. */
import { add } from '../../CharacterRig.js';
/**
 * Reveals the drop pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function dropPose(p, f) {
	const side = f.ledgeHang?.side || -p.face || -1;
	p.chest = add(p.chest, side * 8, 12);
	p.head = add(p.head, side * 10, 10);
	p.leftHand = add(p.leftHand, side * 16, 20);
	p.rightHand = add(p.rightHand, side * 16, 20);
	return p;
}
