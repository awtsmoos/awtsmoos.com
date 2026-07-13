//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the torque model vessel in this instant, revealing
 * its focused js skeleton physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import { clamp } from '../poseMath.js';
/**
 * Reveals the torque model behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} metrics The metrics value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 */
export function torqueModel(f, metrics, intent) {
	const face = metrics.facing;
	return {
		torsoTwist: clamp(
			(f.vx || 0) * 0.025 + intent.hunt * face * 0.08 - intent.panic * face * 0.07,
			-0.4,
			0.4
		),
		hipCounter: clamp(-(f.vx || 0) * 0.018, -0.25, 0.25),
		attackTorque: f.attack ? face * 0.22 : 0
	};
}
