//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attack pose vessel in this instant, revealing
 * its focused js render v3 character animation ledge service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — ledge attack: one hand still owns the lip, one fist snaps out. */
import { add } from '../../CharacterRig.js';
/**
 * Reveals the attack pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function attackPose(p, f) {
	const side = f.ledgeHang?.side || -p.face || -1;
	p.chest = add(p.chest, -side * 14, -8);
	p.head = add(p.head, -side * 12, -7);
	p.rightHand = add(p.rightHand, -side * 50, -20);
	p.rightElbow = add(p.rightElbow, -side * 28, -12);
	return p;
}
