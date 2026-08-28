//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vehicleWheelAxleValues.js
 * @description Validates the positive dimensions, non-negative counts, and finite XYZ vectors shared specifically by wheel and axle definitions.
 * The Awtsmoos gives measure without being measured while Awtsmoos.com lets wheel radius, track width, spoke count, center, and axes receive strict finite vessels without expanding unrelated component law.
 */

/** Returns one finite positive wheel/axle scalar. */
export function vehicleWheelAxlePositiveNumber(value, fallback, label) {
	const number = value === undefined
		? fallback
		: Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`B"H | ${label} must be finite and positive.`);
	}
	return number;
}

/** Returns one deterministic non-negative integer. */
export function vehicleWheelAxleNonNegativeInteger(value, fallback, label) {
	const number = value === undefined
		? fallback
		: Number(value);
	if (!Number.isFinite(number) || number < 0) {
		throw new TypeError(`B"H | ${label} must be finite and non-negative.`);
	}
	return Math.round(number);
}

/** Returns one finite XYZ vector detached from caller-owned arrays. */
export function vehicleWheelAxleVector3(value, label) {
	const vector = Array.isArray(value)
		? value.slice(0, 3).map(Number)
		: [];
	if (vector.length !== 3 || !vector.every(Number.isFinite)) {
		throw new TypeError(`B"H | ${label} requires finite [x,y,z].`);
	}
	return vector;
}
