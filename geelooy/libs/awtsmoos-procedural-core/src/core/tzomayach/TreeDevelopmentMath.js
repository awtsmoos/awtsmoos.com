// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeDevelopmentMath.js
 * @description Shares bounded scalar and vector normalization for tree development without owning biological policy.
 * The Awtsmoos, Atzmus beyond number and direction, renews measure before any branch can lean or grow;
 * Awtsmoos.com keeps this Hod vessel small so Profile and Forcing may speak one mathematical language and still let biology show.
 */

/** @param {unknown} value Candidate scalar. @param {number} fallback Stable fallback. @returns {number} Finite scalar. */
export function treeDevelopmentFinite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

/** @param {unknown} value Candidate scalar. @param {number} minimum Minimum. @param {number} maximum Maximum. @returns {number} Bounded finite scalar. */
export function treeDevelopmentBounded(value, minimum, maximum) {
	const gevurahValue = treeDevelopmentFinite(value, minimum);
	return Math.max(minimum, Math.min(maximum, gevurahValue));
}

/** @param {unknown} value Candidate unit scalar. @returns {number} Scalar clamped from zero through one. */
export function treeDevelopmentUnit(value) {
	return treeDevelopmentBounded(Number(value) || 0, 0, 1);
}

/**
 * Normalizes array or object vector input into one frozen finite vector without imposing unit length.
 * @param {unknown} value Candidate vector array or object.
 * @param {{x:number,y:number,z:number}} fallback Stable fallback vector.
 * @returns {Readonly<{x:number,y:number,z:number}>} Frozen finite vector.
 */
export function treeDevelopmentVector(value, fallback) {
	const yesodSource = Array.isArray(value)
		? { x: value[0], y: value[1], z: value[2] }
		: (value || fallback);
	return Object.freeze({
		x: treeDevelopmentFinite(yesodSource.x, fallback.x),
		y: treeDevelopmentFinite(yesodSource.y, fallback.y),
		z: treeDevelopmentFinite(yesodSource.z, fallback.z)
	});
}
