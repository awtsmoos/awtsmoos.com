//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the climb pose vessel in this instant, revealing
 * its focused js render v3 character animation ledge service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — ledge climb anticipation, chest over stone. */
import { add } from '../../CharacterRig.js';
/**
 * Reveals the climb pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function climbPose(p, f) {
	p = arguments[0];
	const side = f.ledgeHang?.side || -p.face || -1;
	p.chest = add(p.chest, -side * 18, -18);
	p.head = add(p.head, -side * 20, -20);
	p.leftHand = add(p.leftHand, -side * 10, -12);
	p.rightHand = add(p.rightHand, -side * 10, -12);
	p.leftKnee = add(p.leftKnee, -side * 12, -22);
	p.rightKnee = add(p.rightKnee, -side * 8, -18);
	return p;
}
