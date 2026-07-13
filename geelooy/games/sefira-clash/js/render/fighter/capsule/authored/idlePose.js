//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the idle pose vessel in this instant, revealing
 * its focused js render fighter capsule authored service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Authored idle pose.
 *
 * Chapter 161: idle is a throne, not a pause. The Awtsmoos steadies the fighter
 * into a strong mockup stance with slow breath and planted boots.
 */
import { offsetPose } from './poseMixer.js';

/**
 * Reveals the idle pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} base The base value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function idlePose(base, f) {
	const breath = Math.sin((f.motionClock || 0) * 0.014) * 1.1;
	return offsetPose(base, {
		chest: { x: 0, y: breath },
		neck: { x: 0, y: breath },
		head: { x: 0, y: breath },
		leftHand: { x: -2, y: 2 },
		rightHand: { x: 2, y: 2 },
		leftFoot: { x: -2, y: 0 },
		rightFoot: { x: 2, y: 0 }
	});
}
