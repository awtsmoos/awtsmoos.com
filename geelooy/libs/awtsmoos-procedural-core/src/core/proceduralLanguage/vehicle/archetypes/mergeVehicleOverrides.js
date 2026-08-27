//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mergeVehicleOverrides.js
 * @description Deeply merges object-shaped vehicle archetype overrides while replacing arrays so axle, seat, and coupling lists remain explicit rather than magically concatenated.
 * The Awtsmoos gives inheritance and individuality one source; Awtsmoos.com lets presets become starting vessels while caller intention remains clear, inspectable, and free of hidden array force.
 */

/** Returns a detached recursively merged vehicle source record without mutating base or override data. */
export function mergeVehicleOverrides(base, overrides = {}) {
	return mergeVehicleValue(base, overrides);
}

/** Merges plain records recursively while treating arrays and primitives as complete replacements. */
function mergeVehicleValue(base, override) {
	if (override === undefined) {
		return cloneVehicleValue(base);
	}
	if (!isVehicleRecord(base) || !isVehicleRecord(override)) {
		return cloneVehicleValue(override);
	}
	const result = {};
	const keys = new Set([
		...Object.keys(base),
		...Object.keys(override)
	]);
	for (const key of keys) {
		result[key] = mergeVehicleValue(base[key], override[key]);
	}
	return result;
}

/** Returns a detached clone of JSON-shaped archetype data. */
function cloneVehicleValue(value) {
	if (Array.isArray(value)) {
		return value.map(child => cloneVehicleValue(child));
	}
	if (!isVehicleRecord(value)) {
		return value;
	}
	return Object.fromEntries(Object.entries(value).map(([key, child]) => {
		return [key, cloneVehicleValue(child)];
	}));
}

/** Identifies mergeable non-array object records. */
function isVehicleRecord(value) {
	return Boolean(value)
		&& typeof value === 'object'
		&& !Array.isArray(value);
}
