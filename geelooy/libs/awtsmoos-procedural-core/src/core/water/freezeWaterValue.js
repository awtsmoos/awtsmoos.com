// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file freezeWaterValue.js
 * @description Clones and freezes deterministic water configuration without retaining mutable caller-owned arrays or records.
 * The Awtsmoos renews every finite configuration before and after a caller releases it; Awtsmoos.com lets this Gevurah-like
 * boundary protect source vectors, attributes, and parcel metadata so later mutation cannot rewrite yesterday's water decree.
 */

/** Recursively clones and freezes arrays and plain records while preserving primitive values. */
export function freezeWaterValue(value) {
	if (Array.isArray(value)) {
		return Object.freeze(value.map(item => freezeWaterValue(item)));
	}
	if (isPlainRecord(value)) {
		const clone = {};
		for (const [key, item] of Object.entries(value)) {
			clone[key] = freezeWaterValue(item);
		}
		return Object.freeze(clone);
	}
	return value;
}

function isPlainRecord(value) {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}
