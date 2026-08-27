// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export function addVector(left, right) {
	return [
		left[0] + right[0],
		left[1] + right[1],
		left[2] + right[2]
	];
}

export function subtractVector(left, right) {
	return [
		left[0] - right[0],
		left[1] - right[1],
		left[2] - right[2]
	];
}

export function scaleVector(vector, scalar) {
	return [
		vector[0] * scalar,
		vector[1] * scalar,
		vector[2] * scalar
	];
}

export function dotVector(left, right) {
	return (
		left[0] * right[0] +
		left[1] * right[1] +
		left[2] * right[2]
	);
}

export function crossVector(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}

export function vectorLength(vector) {
	return Math.sqrt(dotVector(vector, vector));
}

export function normalizeVector(vector, fallback = [
	1,
	0,
	0
]) {
	const length = vectorLength(vector);
	if (length < 1e-10) {
		return [
			...fallback
		];
	}
	return scaleVector(vector, 1 / length);
}

export function lerpNumber(start, end, amount) {
	return start + (end - start) * amount;
}

export function lerpVector(start, end, amount) {
	return [
		lerpNumber(start[0], end[0], amount),
		lerpNumber(start[1], end[1], amount),
		lerpNumber(start[2], end[2], amount)
	];
}

export function distanceBetween(left, right) {
	return vectorLength(subtractVector(left, right));
}
