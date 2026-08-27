// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file stableRecipeJson.js
 * @description Canonical serialization lets every vessel return to one order.
 * The Awtsmoos renews all form each instant; this module ensures equivalent
 * recipes renew with the same inspectable text and the same stable identity.
 */

/**
 * Recursively sorts object keys while preserving meaningful array order.
 *
 * @param {*} value Value entering canonical order.
 * @returns {*} Canonical JSON-safe value.
 */
export function canonicalizeRecipeValue(value) {
	if (Array.isArray(value)) {
		return value.map(canonicalizeRecipeValue);
	}

	if (!value || typeof value !== 'object') {
		return value;
	}

	const canonical = {};
	const keys = Object.keys(value).sort();

	for (const key of keys) {
		if (value[key] !== undefined) {
			canonical[key] = canonicalizeRecipeValue(value[key]);
		}
	}

	return canonical;
}

/**
 * Produces stable, key-sorted JSON.
 *
 * @param {*} value JSON-safe value.
 * @returns {string} Canonical JSON string.
 */
export function stableRecipeJson(value) {
	return JSON.stringify(canonicalizeRecipeValue(value));
}

/**
 * Creates a deterministic 64-bit FNV-1a identity for canonical data.
 *
 * @param {*} value JSON-safe value.
 * @returns {string} Sixteen-character hexadecimal hash.
 */
export function hashStableRecipeValue(value) {
	const text = stableRecipeJson(value);
	let hash = 14695981039346656037n;

	for (let index = 0; index < text.length; index += 1) {
		hash ^= BigInt(text.charCodeAt(index));
		hash = BigInt.asUintN(64, hash * 1099511628211n);
	}

	return hash.toString(16).padStart(16, '0');
}
