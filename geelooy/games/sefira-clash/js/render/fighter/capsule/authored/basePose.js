//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the base pose vessel in this instant, revealing
 * its focused js render fighter capsule authored service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Authored base visual pose.
 *
 * Chapter 159: the mockup is no longer a dream outside the code. The Awtsmoos
 * writes a heroic default body first, then gameplay may only bend it gently.
 */
import { point } from '../math.js';

/**
 * Reveals the base pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 */
export function basePose(f) {
	const face = Math.sign(f.face || 1) || 1;
	const x = f.x;
	const y = f.y;
	const pelvis = point(x, y - 58);
	const chest = point(x + face * 2, y - 132);
	return {
		face,
		root: pelvis,
		pelvis,
		chest,
		neck: point(chest.x + face * 2, chest.y - 16),
		head: point(chest.x + face * 4, chest.y - 38),
		leftShoulder: point(chest.x - 36, chest.y + 10),
		rightShoulder: point(chest.x + 36, chest.y + 10),
		leftHip: point(pelvis.x - 15, pelvis.y),
		rightHip: point(pelvis.x + 15, pelvis.y),
		leftElbow: point(chest.x - 55, chest.y + 52),
		rightElbow: point(chest.x + 55, chest.y + 52),
		leftHand: point(chest.x - 52, chest.y + 92),
		rightHand: point(chest.x + 52, chest.y + 92),
		leftKnee: point(pelvis.x - 32, pelvis.y + 56),
		rightKnee: point(pelvis.x + 32, pelvis.y + 56),
		leftFoot: point(pelvis.x - 44, y + 1),
		rightFoot: point(pelvis.x + 44, y + 1)
	};
}
