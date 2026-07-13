//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the landing layer vessel in this instant, revealing
 * its focused js render v3 character animation layers service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — landing: the earth answers the fighter in knees and breath. */
import { add } from '../../CharacterRig.js';

/**
 * Reveals the landing layer behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} info The info value entering this behavior.
 */
export function landingLayer(p, info) {
	if (!['landing', 'hardLanding'].includes(info.name)) return p;
	const hard = info.name === 'hardLanding' ? 1 : 0.45;
	p.chest = add(p.chest, -p.face * 4 * hard, 12 * hard);
	p.head = add(p.head, -p.face * 3 * hard, 9 * hard);
	p.leftHand = add(p.leftHand, -p.face * (12 + hard * 10), 12 + hard * 4);
	p.rightHand = add(p.rightHand, p.face * (12 + hard * 10), 12 + hard * 4);
	p.leftKnee = add(p.leftKnee, -p.face * (8 + hard * 5), -14 * hard);
	p.rightKnee = add(p.rightKnee, p.face * (8 + hard * 5), -14 * hard);
	p.leftFoot = add(p.leftFoot, -p.face * hard * 4, 0);
	p.rightFoot = add(p.rightFoot, p.face * hard * 4, 0);
	return p;
}
