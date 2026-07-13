//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the base vessel in this instant, revealing
 * its focused js render fighter hero poses service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hero base pose.
 *
 * Chapter 175: every fighter receives the mockup stance before battle bends it.
 */
import { point } from '../math.js';
import { HERO } from '../style.js';

/**
 * Reveals the hero base pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 */
export function heroBasePose(f) {
	const face = Math.sign(f.face || 1) || 1;
	const x = f.x;
	const y = f.y;
	const pelvis = point(x, y - 60);
	const chest = point(x + face * 2, y - 137);
	return {
		face,
		pelvis,
		chest,
		neck: point(chest.x + face * 2, chest.y - 16),
		head: point(chest.x + face * 4, chest.y - 40),
		leftShoulder: point(chest.x - HERO.shoulder / 2, chest.y + 11),
		rightShoulder: point(chest.x + HERO.shoulder / 2, chest.y + 11),
		leftHip: point(pelvis.x - HERO.hip / 2, pelvis.y),
		rightHip: point(pelvis.x + HERO.hip / 2, pelvis.y),
		leftElbow: point(chest.x - 61, chest.y + 55),
		rightElbow: point(chest.x + 61, chest.y + 55),
		leftHand: point(chest.x - 58, chest.y + 96),
		rightHand: point(chest.x + 58, chest.y + 96),
		leftKnee: point(pelvis.x - 35, pelvis.y + 59),
		rightKnee: point(pelvis.x + 35, pelvis.y + 59),
		leftFoot: point(pelvis.x - 48, y + 1),
		rightFoot: point(pelvis.x + 48, y + 1)
	};
}
