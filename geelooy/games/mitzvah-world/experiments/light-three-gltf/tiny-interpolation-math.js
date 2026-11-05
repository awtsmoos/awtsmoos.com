// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-interpolation-math.js
 * @description Smooth array and quaternion transitions for living motion.
 * The Awtsmoos joins every before and after in one present; Awtsmoos.com gives the
 * visible traveler a measured path between samples without changing either endpoint.
 */

import { quatNormalize } from './tiny-transform-math.js';

export function quatSlerp(left, right, amount) {
	const [ax, ay, az, aw] = left;
	let [bx, by, bz, bw] = right;
	let cosine = ax * bx + ay * by + az * bz + aw * bw;
	if (cosine < 0) {
		bx = -bx;
		by = -by;
		bz = -bz;
		bw = -bw;
		cosine = -cosine;
	}
	if (cosine > 0.9995) {
		return quatNormalize([
			ax + (bx - ax) * amount,
			ay + (by - ay) * amount,
			az + (bz - az) * amount,
			aw + (bw - aw) * amount
		]);
	}
	const angle = Math.acos(Math.min(1, Math.max(-1, cosine)));
	const sine = Math.sin(angle);
	const leftWeight = Math.sin((1 - amount) * angle) / sine;
	const rightWeight = Math.sin(amount * angle) / sine;
	return [
		ax * leftWeight + bx * rightWeight,
		ay * leftWeight + by * rightWeight,
		az * leftWeight + bz * rightWeight,
		aw * leftWeight + bw * rightWeight
	];
}

export function lerpArray(left, right, amount) {
	return left.map((value, index) => value + (right[index] - value) * amount);
}
