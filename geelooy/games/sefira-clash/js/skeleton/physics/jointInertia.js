//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the joint inertia vessel in this instant, revealing
 * its focused js skeleton physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import { clamp } from '../poseMath.js';
/**
 * Reveals the joint inertia behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} pose The pose value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} body The body value entering this behavior.
 */
export function jointInertia(pose, f, body) {
	const mem = f.poseMemory?.points || {},
		s = body.height;
	lag(pose, 'head', mem.head, 0.18 * s, 0.28);
	lag(pose, 'leftHand', mem.leftHand, 0.36 * s, 0.45);
	lag(pose, 'rightHand', mem.rightHand, 0.36 * s, 0.45);
	lag(pose, 'leftFoot', mem.leftFoot, 0.18 * s, 0.25);
	lag(pose, 'rightFoot', mem.rightFoot, 0.18 * s, 0.25);
	return pose;
}
function lag(pose, name, m, max, k) {
	if (!pose[name] || !m) return;
	pose[name].x -= clamp(m.vx * k, -max, max);
	pose[name].y -= clamp(m.vy * k, -max, max);
}
