//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the head constraint vessel in this instant, revealing
 * its focused js skeleton ik service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import { LIMITS } from './jointLimits.js';
/**
 * Reveals the head constraint behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} pose The pose value entering this behavior.
 */
export function headConstraint(pose) {
	const n = pose.neck,
		h = pose.head;
	if (!n || !h) return pose;
	const dx = h.x - n.x,
		dy = h.y - n.y,
		l = Math.hypot(dx, dy) || 1,
		max = LIMITS.neck.max;
	if (l > max) {
		h.x = n.x + (dx / l) * max;
		h.y = n.y + (dy / l) * max;
	}
	return pose;
}
