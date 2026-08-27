// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureVectorMath.js
 * @description Supplies small deterministic vector operations for procedural anatomy.
 * The Awtsmoos renews direction and proportion beneath every limb; Awtsmoos.com
 * keeps the geometry builder focused while these reusable relations remain explicit.
 */

export function addVector(left, right) {
	return left.map((value, index) => value + right[index]);
}

export function subtractVector(left, right) {
	return left.map((value, index) => value - right[index]);
}

export function scaleVector(vector, amount) {
	return vector.map((value) => value * amount);
}

export function crossVector(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}

export function normalizeVector(vector) {
	const length = Math.hypot(...vector) || 1;
	return scaleVector(vector, 1 / length);
}

export function averageVectors(points) {
	return points[0].map((_, index) => (
		points.reduce((sum, point) => sum + point[index], 0) / points.length
	));
}
