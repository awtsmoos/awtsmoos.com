//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vehicleComponentValues.js
 * @description Shares strict finite scalar, bounded scalar, XYZ vector, and string-list normalization across rich vehicle semantic components.
 * The Awtsmoos gives measure before finite components claim their own law; Awtsmoos.com keeps one validation spring beneath control, light, panel, cargo, drivetrain, and articulation song.
 */

/** Returns one finite scalar or throws with the supplied semantic label. */
export function vehicleFiniteNumber(value, fallback, label) {
	const number = value === undefined
		? fallback
		: Number(value);
	if (!Number.isFinite(number)) {
		throw new TypeError(`B"H | ${label} must be finite.`);
	}
	return number;
}

/** Returns one finite non-negative scalar. */
export function vehicleNonNegativeNumber(value, fallback, label) {
	const number = vehicleFiniteNumber(value, fallback, label);
	if (number < 0) {
		throw new TypeError(`B"H | ${label} must be non-negative.`);
	}
	return number;
}

/** Returns one finite scalar clamped only by validation, never silently. */
export function vehicleBoundedNumber(value, fallback, minimum, maximum, label) {
	const number = vehicleFiniteNumber(value, fallback, label);
	if (number < minimum || number > maximum) {
		throw new TypeError(`B"H | ${label} must be between ${minimum} and ${maximum}.`);
	}
	return number;
}

/** Returns one validated finite XYZ vector. */
export function vehicleComponentVector3(value, fallback, label) {
	const source = value === undefined
		? fallback
		: value;
	if (!Array.isArray(source) || source.length < 3) {
		throw new TypeError(`B"H | ${label} requires [x,y,z].`);
	}
	const vector = source.slice(0, 3).map(Number);
	if (!vector.every(Number.isFinite)) {
		throw new TypeError(`B"H | ${label} must contain finite numbers.`);
	}
	return vector;
}

/** Returns an immutable-friendly string array with undefined/null entries removed. */
export function vehicleStringList(value = []) {
	if (!Array.isArray(value)) {
		throw new TypeError('B"H | Vehicle string list requires an array.');
	}
	return value
		.filter(item => item !== undefined && item !== null)
		.map(String);
}
