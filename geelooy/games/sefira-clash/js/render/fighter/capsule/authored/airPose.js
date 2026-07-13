//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the air pose vessel in this instant, revealing
 * its focused js render fighter capsule authored service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Authored air pose.
 *
 * Chapter 163: jump and fall are no longer accidental bends. The Awtsmoos lifts
 * the fighter, but feet never betray the knees or break the readable body.
 */
import { offsetPose } from './poseMixer.js';

/**
 * Reveals the air pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} base The base value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function airPose(base, f) {
	const lift = Math.max(-1, Math.min(1, -(f.vy || 0) / 10));
	return offsetPose(base, {
		chest: { x: 0, y: -4 * lift },
		neck: { x: 0, y: -4 * lift },
		head: { x: 0, y: -5 * lift },
		leftElbow: { x: -5, y: -5 * lift },
		rightElbow: { x: 5, y: -5 * lift },
		leftHand: { x: -7, y: -7 * lift },
		rightHand: { x: 7, y: -7 * lift },
		leftKnee: { x: -8, y: -8 * lift },
		rightKnee: { x: 8, y: -8 * lift },
		leftFoot: { x: -10, y: -5 * lift },
		rightFoot: { x: 10, y: -5 * lift }
	});
}
