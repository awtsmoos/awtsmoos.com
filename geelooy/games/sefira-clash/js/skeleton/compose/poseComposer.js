//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the pose composer vessel in this instant, revealing
 * its focused js skeleton compose service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import { byPriority } from './posePriority.js';
/**
 * Reveals the apply influences behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} pose The pose value entering this behavior.
 * @param {*} influences The influences value entering this behavior.
 */
export function applyInfluences(pose, influences = []) {
	for (const i of influences.flat().filter(Boolean).sort(byPriority)) {
		const pt = pose[i.point];
		if (!pt) continue;
		const w = Number.isFinite(i.weight) ? i.weight : 1;
		pt.x += (i.dx || 0) * w;
		pt.y += (i.dy || 0) * w;
	}
	return pose;
}
/**
 * Reveals the collect influences behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} sets The sets value entering this behavior.
 */
export function collectInfluences(...sets) {
	return sets.flatMap(s => (Array.isArray(s) ? s : s?.items || []));
}
