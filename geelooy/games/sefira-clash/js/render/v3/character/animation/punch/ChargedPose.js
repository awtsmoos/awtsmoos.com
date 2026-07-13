//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the charged pose vessel in this instant, revealing
 * its focused js render v3 character animation punch service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — charged punch crouches, coils, explodes, and overshoots. */
import { add } from '../../CharacterRig.js';
/**
 * Reveals the charged pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} face The face value entering this behavior.
 * @param {*} side The side value entering this behavior.
 * @param {*} other The other value entering this behavior.
 * @param {*} sign The sign value entering this behavior.
 * @param {*} wind The wind value entering this behavior.
 * @param {*} hit The hit value entering this behavior.
 * @param {*} rec The rec value entering this behavior.
 * @param {*} reach The reach value entering this behavior.
 * @param {*} heavy The heavy value entering this behavior.
 */
export function chargedPose(p, face, side, other, sign, wind, hit, rec, reach, heavy) {
	p.pelvis = add(p.pelvis, -face * wind * (16 + heavy * 10) + face * hit * 8, wind * 8 - rec * 2);
	p.chest = add(
		p.chest,
		-face * wind * (30 + heavy * 14) + face * hit * (28 + heavy * 20) - face * rec * 14,
		-wind * 13 - hit * 7 + rec * 8
	);
	p.head = add(p.head, -face * wind * 14 + face * hit * 12, -wind * 6 - hit * 3 + rec * 2);
	p[side + 'Elbow'] = add(
		p[side + 'Shoulder'],
		sign * (-wind * 38 + hit * reach * 0.56 + rec * 45),
		34 - wind * 34 - hit * 22 + rec * 26
	);
	p[side + 'Hand'] = add(
		p[side + 'Shoulder'],
		sign * (-wind * 56 + hit * reach + rec * 62),
		30 - wind * 42 - hit * 28 + rec * 28
	);
	p[other + 'Hand'] = add(p[other + 'Shoulder'], -sign * (38 + wind * 28), 58 - wind * 18);
	p.leftKnee = add(p.leftKnee, -face * wind * 8, -wind * 10);
	p.rightKnee = add(p.rightKnee, face * hit * 10, -hit * 6);
	p.leftFoot = add(p.leftFoot, -face * wind * 8, 0);
	p.rightFoot = add(p.rightFoot, face * hit * 12, 0);
	return p;
}
