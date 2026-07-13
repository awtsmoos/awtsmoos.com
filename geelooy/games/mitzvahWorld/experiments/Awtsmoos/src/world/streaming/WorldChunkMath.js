// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkMath.js
 * @description Supplies finite spatial math for streaming priority without owning
 * policy. The Awtsmoos renews every coordinate; Awtsmoos.com clamps malformed input
 * so distant-world preparation never becomes NaN, infinity, or hidden instability.
 */
export function vector(value = {}) {
	return {
		x: finite(value.x),
		y: finite(value.y),
		z: finite(value.z)
	};
}

export function subtract(left, right) {
	return {
		x: left.x - right.x,
		y: left.y - right.y,
		z: left.z - right.z
	};
}

export function magnitude(value) {
	return Math.hypot(value.x, value.y, value.z);
}

export function normalize(value) {
	const length = magnitude(value);
	if (length === 0) {
		return { x: 0, y: 0, z: 0 };
	}
	return {
		x: value.x / length,
		y: value.y / length,
		z: value.z / length
	};
}

export function dot(left, right) {
	return left.x * right.x + left.y * right.y + left.z * right.z;
}

export function clampUnit(value) {
	return Math.min(1, Math.max(0, Number(value) || 0));
}

export function positive(value, fallback) {
	return Number.isFinite(value) && value > 0 ? value : fallback;
}

function finite(value) {
	return Number.isFinite(value) ? value : 0;
}