//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the pose mixer vessel in this instant, revealing
 * its focused js render fighter capsule authored service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Authored pose mixer.
 *
 * Chapter 160: every pose is a melody. The Awtsmoos blends only the points that
 * matter, letting authored silhouettes rule over frantic procedural noise.
 */
import { point, clamp } from '../math.js';

/**
 * Reveals the mix pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 * @param {*} t The t value entering this behavior.
 */
export function mixPose(a, b, t) {
	const k = clamp(t, 0, 1);
	const out = { ...a, face: b.face || a.face };
	for (const key of Object.keys(a)) {
		if (key === 'face') continue;
		if (a[key]?.x !== undefined && b[key]?.x !== undefined)
			out[key] = point(
				a[key].x + (b[key].x - a[key].x) * k,
				a[key].y + (b[key].y - a[key].y) * k
			);
	}
	return out;
}

/**
 * Reveals the offset pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} changes The changes value entering this behavior.
 */
export function offsetPose(p, changes) {
	const out = { ...p };
	for (const [key, delta] of Object.entries(changes)) {
		if (!p[key] || typeof delta.x !== 'number') continue;
		out[key] = point(p[key].x + delta.x, p[key].y + delta.y);
	}
	return out;
}

/**
 * Reveals the smooth behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} t The t value entering this behavior.
 */
export function smooth(t) {
	const x = clamp(t, 0, 1);
	return x * x * (3 - 2 * x);
}
