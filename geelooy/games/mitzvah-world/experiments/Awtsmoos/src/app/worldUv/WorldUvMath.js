//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WorldUvMath.js
 * @description Provides bounded numerical helpers for world-space UV projection and mirror-repeat diagnostics.
 * These functions are renderer-neutral: they sanitize finite scalar input, mirror arbitrary repeat-space values,
 * and measure typed-array extrema without allocating large intermediates or spreading arrays onto the call stack.
 */

/**
 * Converts an arbitrary value into a finite number.
 * @param {*} value Candidate numeric value.
 * @param {number} fallback Replacement used when conversion is not finite.
 * @returns {number} Finite numeric result.
 */
export function finiteWorldNumber(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

/**
 * Converts an arbitrary value into a strictly positive finite number.
 * @param {*} value Candidate value.
 * @param {number} fallback Positive fallback.
 * @returns {number} Positive result.
 */export function positiveWorldNumber(value, fallback = 1) {
	const number = finiteWorldNumber(value, fallback);
	return number > 0 ? number : fallback;
}

/**
 * Mirrors one arbitrary repeat-space coordinate into the continuous zero-to-one interval.
 * @param {*} value Repeat-space coordinate.
 * @returns {number} Mirrored coordinate.
 */
export function worldUvPingPongCoordinate(value) {
	const coordinate = finiteWorldNumber(value);
	const cell = Math.floor(coordinate);
	const fraction = coordinate - cell;
	return Math.abs(cell % 2) === 1
		? 1 - fraction
		: fraction;
}

/**
 * Measures mirrored extrema in one bounded pass.
 * @param {ArrayLike<number>} values Numeric UV component stream.
 * @returns {number[]} Minimum and maximum mirrored coordinate.
 */
export function worldUvPingPongRange(values) {
	let minimum = Infinity;
	let maximum = -Infinity;
	for (const value of values) {
		const mirrored = worldUvPingPongCoordinate(value);
		minimum = Math.min(minimum, mirrored);
		maximum = Math.max(maximum, mirrored);
	}
	return values.length ? [minimum, maximum] : [0, 0];
}

/**
 * Measures raw interleaved U/V extrema without copying the array.
 * @param {ArrayLike<number>} values Interleaved U/V stream.
 * @returns {number[]} Minimum U, maximum U, minimum V, maximum V.
 */
export function worldUvRepeatRange(values) {
	let maximumU = -Infinity;
	let maximumV = -Infinity;
	let minimumU = Infinity;
	let minimumV = Infinity;
	for (let index = 0; index < values.length; index += 2) {
		minimumU = Math.min(minimumU, values[index]);
		maximumU = Math.max(maximumU, values[index]);
		minimumV = Math.min(minimumV, values[index + 1]);
		maximumV = Math.max(maximumV, values[index + 1]);
	}
	return values.length
		? [minimumU, maximumU, minimumV, maximumV]
		: [0, 0, 0, 0];
}
