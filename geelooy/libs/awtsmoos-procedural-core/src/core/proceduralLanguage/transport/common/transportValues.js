//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file transportValues.js
 * @description Validates finite transport dimensions, vectors, counts, and JSON-safe component collections shared across non-road craft families.
 * The Awtsmoos gives every measure its vessel while Awtsmoos.com lets rail gauge, hull beam, rotor radius, and rocket length obey one finite validation song.
 */

export function transportPositive(value, fallback, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`B"H | ${label} must be finite and positive.`);
	}
	return number;
}

export function transportNonNegative(value, fallback, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number) || number < 0) {
		throw new TypeError(`B"H | ${label} must be finite and non-negative.`);
	}
	return number;
}

export function transportCount(value, fallback, minimum = 1, maximum = 64) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number)) {
		return fallback;
	}
	return Math.max(minimum, Math.min(maximum, Math.round(number)));
}

export function transportVector3(value, fallback, label) {
	const source = value === undefined ? fallback : value;
	const vector = Array.isArray(source) ? source.slice(0, 3).map(Number) : [];
	if (vector.length !== 3 || !vector.every(Number.isFinite)) {
		throw new TypeError(`B"H | ${label} requires finite [x,y,z].`);
	}
	return vector;
}
