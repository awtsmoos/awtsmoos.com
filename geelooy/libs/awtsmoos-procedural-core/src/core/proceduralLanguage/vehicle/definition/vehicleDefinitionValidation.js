//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vehicleDefinitionValidation.js
 * @description Guards vehicle dimensions, identifiers, vector shape, and duplicate subsystem IDs before geometry receives semantic intent.
 * The Awtsmoos gives boundless possibility while Awtsmoos.com lets Gevurah reject impossible dimensions and duplicate names before they become tangled wheels in finite frames.
 */

/** Returns one finite positive scalar or throws with a vehicle-specific diagnostic message. */
export function vehiclePositiveNumber(value, fallback, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`B"H | ${label} must be finite and positive.`);
	}
	return number;
}

/** Returns one finite non-negative scalar or throws with a vehicle-specific diagnostic message. */
export function vehicleNonNegativeNumber(value, fallback, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number) || number < 0) {
		throw new TypeError(`B"H | ${label} must be finite and non-negative.`);
	}
	return number;
}

/** Validates one canonical XYZ vector. */
export function vehicleVector3(value, label = 'vehicle vector') {
	if (!Array.isArray(value) || value.length < 3) {
		throw new TypeError(`B"H | ${label} requires [x,y,z].`);
	}
	const vector = value.slice(0, 3).map(Number);
	if (!vector.every(Number.isFinite)) {
		throw new TypeError(`B"H | ${label} must contain finite numbers.`);
	}
	return vector;
}

/** Rejects duplicate IDs in one semantic collection so sockets and ranges remain addressable. */
export function assertUniqueVehicleIds(entries, label) {
	const seen = new Set();
	for (const entry of entries) {
		const id = String(entry.id);
		if (seen.has(id)) {
			throw new TypeError(`B"H | Duplicate ${label} id: ${id}`);
		}
		seen.add(id);
	}
}
