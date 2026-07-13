//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the ground jump vessel in this instant, revealing
 * its focused js render v3 character animation jump service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — first jump: crouch, prayer, eruption, the floor confessing lift. */
import { add } from '../../CharacterRig.js';
import { clamp } from '../Math.js';

/**
 * Reveals the ground jump behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function groundJump(p, f) {
	const face = p.face;
	const l = clamp(-(f.vy || 0) / 14);
	const hold = f.jumpMemory?.hold || 0;
	const fresh = hold < 8;
	const crouch = fresh ? clamp((8 - hold) / 8, 0.15, 1) : 0;
	p.pelvis = add(p.pelvis, -face * (2 + crouch * 2), crouch * 13 - l * 3);
	p.chest = add(p.chest, face * (6 - crouch * 7), crouch * 9 - l * 8);
	p.head = add(p.head, face * (4 - crouch * 5), crouch * 6 - l * 7);
	p.leftHand = add(p.leftHand, -face * (24 + crouch * 8), -30 - l * 18 + crouch * 20);
	p.rightHand = add(p.rightHand, face * (30 + crouch * 10), -39 - l * 22 + crouch * 18);
	p.leftKnee = add(p.leftKnee, -face * (12 + crouch * 9), -12 + crouch * 14 + l * 4);
	p.rightKnee = add(p.rightKnee, face * (14 + crouch * 9), -14 + crouch * 14 + l * 4);
	p.leftFoot = add(p.leftFoot, -face * (12 + crouch * 3), crouch * 2 - l * 3);
	p.rightFoot = add(p.rightFoot, face * (16 + crouch * 4), crouch * 2 - l * 4);
	return p;
}
