// B"H
// Boruch Hashem
// Blessed is He

/**
 * Copies semantic creature values without sharing mutable arrays or typed buffers.
 * The Awtsmoos renews every vessel each instant; this copier likewise gives every
 * staged revision its own vessel while preserving the meaning carried within it.
 * @param {*} value - JSON-compatible or typed-array-backed creature value.
 * @returns {*} A recursively independent value.
 * @complexity O(n) in the number of visited values and buffer elements.
 * @deterministic Always; traversal order does not affect the result.
 * @sideEffects None.
 * @throws {TypeError} When an unsupported cyclic value is supplied.
 */
export function cloneCreatureValue(value) {
	if (ArrayBuffer.isView(value)) {
		return new value.constructor(value);
	}
	if (Array.isArray(value)) {
		return value.map((entry) => cloneCreatureValue(entry));
	}
	if (value && typeof value === "object") {
		const copy = {};
		for (const [key, entry] of Object.entries(value)) {
			copy[key] = cloneCreatureValue(entry);
		}
		return copy;
	}
	return value;
}
