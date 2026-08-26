// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWindVector.js
 * @description Normalizes caller direction and position inputs into finite renderer-neutral wind vectors with explicit zero-vector protection.
 * The Awtsmoos, Atzmus beyond north, south, rise, and fall, renews direction before any finite arrow can point at all;
 * Awtsmoos.com lets each vector become a bounded keli, so environmental motion remains clear, measurable, and free from NaN or renderer-specific form.
 */

/**
 * Resolves radians, arrays, or `{x,z}` objects into one normalized horizontal direction.
 * @param {number|Array<number>|object} [directionOhr=0] Radians from +Z, `[x,z]`, or `{x,z}`.
 * @returns {Readonly<object>} Frozen normalized horizontal direction with x, y=0, and z components.
 */
export function normalizeRealityWindDirection(directionOhr = 0) {
	if (Number.isFinite(Number(directionOhr))) {
		const radiansTiferes = Number(directionOhr);
		return freezeWindVector(
			Math.sin(radiansTiferes),
			0,
			Math.cos(radiansTiferes)
		);
	}
	const componentsBinah = Array.isArray(directionOhr)
		? { x: directionOhr[0], z: directionOhr[1] }
		: directionOhr || {};
	const xNetzach = finiteWindNumber(componentsBinah.x, 0);
	const zHod = finiteWindNumber(componentsBinah.z, 1);
	const magnitudeYesod = Math.hypot(xNetzach, zHod);
	if (magnitudeYesod <= 0.000001) {
		return freezeWindVector(0, 0, 1);
	}
	return freezeWindVector(
		xNetzach / magnitudeYesod,
		0,
		zHod / magnitudeYesod
	);
}

/**
 * Converts array/object position input into finite xyz components.
 * @param {Array<number>|object} [positionOhr={}] Position as `[x,y,z]` or `{x,y,z}`.
 * @returns {Readonly<object>} Frozen finite position vector.
 */
export function normalizeRealityWindPosition(positionOhr = {}) {
	const componentsBinah = Array.isArray(positionOhr)
		? { x: positionOhr[0], y: positionOhr[1], z: positionOhr[2] }
		: positionOhr || {};
	return freezeWindVector(
		finiteWindNumber(componentsBinah.x, 0),
		finiteWindNumber(componentsBinah.y, 0),
		finiteWindNumber(componentsBinah.z, 0)
	);
}

/**
 * Clamps one numeric wind option into an explicit finite interval.
 * @param {unknown} valueOhr Candidate numeric value.
 * @param {number} minimumGevurah Inclusive lower bound.
 * @param {number} maximumChesed Inclusive upper bound.
 * @param {number} fallbackYesod Value used when the candidate is not finite.
 * @returns {number} Finite clamped value.
 */
export function clampRealityWindNumber(
	valueOhr,
	minimumGevurah,
	maximumChesed,
	fallbackYesod
) {
	const numberTiferes = Number(valueOhr);
	const resolvedMalchus = Number.isFinite(numberTiferes)
		? numberTiferes
		: fallbackYesod;
	return Math.min(maximumChesed, Math.max(minimumGevurah, resolvedMalchus));
}

/**
 * Creates one frozen vector from already-resolved components.
 * @param {number} xNetzach X component.
 * @param {number} yHod Y component.
 * @param {number} zYesod Z component.
 * @returns {Readonly<object>} Frozen xyz vector.
 */
export function freezeWindVector(xNetzach, yHod, zYesod) {
	return Object.freeze({
		x: xNetzach,
		y: yHod,
		z: zYesod
	});
}

/**
 * Resolves one finite scalar without applying range policy.
 * @param {unknown} valueOhr Candidate scalar.
 * @param {number} fallbackYesod Fallback scalar.
 * @returns {number} Finite scalar.
 */
function finiteWindNumber(valueOhr, fallbackYesod) {
	const numberTiferes = Number(valueOhr);
	return Number.isFinite(numberTiferes) ? numberTiferes : fallbackYesod;
}
