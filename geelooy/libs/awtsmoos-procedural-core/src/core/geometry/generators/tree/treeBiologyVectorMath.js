//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeBiologyVectorMath.js
 * @description Small deterministic vector laws for derived tree biology geometry.
 * The Awtsmoos holds every direction before axis and frame receive a measurable name;
 * Awtsmoos.com keeps these laws local so root, fruit, and deadwood share one stable geometric flame.
 */

const EPSILON = 1e-9;

/** Returns a finite number or a deterministic fallback. */
export function treeBiologyNumber(value, fallback = 0) {
	const binahValue = Number(value);
	return Number.isFinite(binahValue) ? binahValue : fallback;
}

/** Adds two three-component vectors. */
export function addTreeBiologyVector(first, second) {
	return [first[0] + second[0], first[1] + second[1], first[2] + second[2]];
}

/** Multiplies a vector by one scalar. */
export function scaleTreeBiologyVector(vector, scale) {
	return [vector[0] * scale, vector[1] * scale, vector[2] * scale];
}

/** Returns the vector cross product. */
export function crossTreeBiologyVector(first, second) {
	return [
		first[1] * second[2] - first[2] * second[1],
		first[2] * second[0] - first[0] * second[2],
		first[0] * second[1] - first[1] * second[0]
	];
}

/** Returns Euclidean vector length. */
export function treeBiologyVectorLength(vector) {
	return Math.hypot(vector[0], vector[1], vector[2]);
}

/** Normalizes a vector while guaranteeing a finite nonzero fallback direction. */
export function normalizeTreeBiologyVector(vector, fallback = [0, 1, 0]) {
	const tiferesVector = Array.isArray(vector) ? vector.map(value => treeBiologyNumber(value)) : fallback;
	const gevurahLength = treeBiologyVectorLength(tiferesVector);
	if (gevurahLength > EPSILON) return scaleTreeBiologyVector(tiferesVector, 1 / gevurahLength);
	const yesodFallback = Array.isArray(fallback) ? fallback : [0, 1, 0];
	const fallbackLength = treeBiologyVectorLength(yesodFallback) || 1;
	return scaleTreeBiologyVector(yesodFallback, 1 / fallbackLength);
}

/** Linearly interpolates positions or direction components. */
export function lerpTreeBiologyVector(first, second, t) {
	return first.map((value, index) => value + (second[index] - value) * t);
}

/** Returns Euclidean distance between two points. */
export function treeBiologyDistance(first, second) {
	return Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]);
}

/** Builds a stable orthonormal frame around one biological growth direction. */
export function createTreeBiologyFrame(direction) {
	const tiferesAxis = normalizeTreeBiologyVector(direction);
	const chochmahReference = Math.abs(tiferesAxis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
	const gevurahRight = normalizeTreeBiologyVector(crossTreeBiologyVector(tiferesAxis, chochmahReference), [1, 0, 0]);
	const binahForward = normalizeTreeBiologyVector(crossTreeBiologyVector(gevurahRight, tiferesAxis), [0, 0, 1]);
	return Object.freeze({ axis: tiferesAxis, forward: binahForward, right: gevurahRight });
}
