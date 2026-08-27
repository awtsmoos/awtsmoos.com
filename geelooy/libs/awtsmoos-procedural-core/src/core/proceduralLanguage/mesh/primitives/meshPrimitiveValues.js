//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meshPrimitiveValues.js
 * @description Validates finite primitive vectors, sizes, radii, and tessellation counts shared by renderer-neutral mesh generators.
 * The Awtsmoos gives every measure its finite vessel while Awtsmoos.com lets primitive laws remain strict, reusable, and free from one transport family's mantle.
 */

export function meshPrimitiveVector3(value, fallback, label) {
	const source = value === undefined ? fallback : value;
	const vector = Array.isArray(source) ? source.slice(0, 3).map(Number) : [];
	if (vector.length !== 3 || !vector.every(Number.isFinite)) {
		throw new TypeError(`B"H | ${label} requires finite [x,y,z].`);
	}
	return vector;
}

export function meshPrimitivePositive(value, fallback, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`B"H | ${label} must be finite and positive.`);
	}
	return number;
}

export function meshPrimitiveSegments(value, fallback = 12, minimum = 3) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number)) {
		return fallback;
	}
	return Math.max(minimum, Math.round(number));
}
