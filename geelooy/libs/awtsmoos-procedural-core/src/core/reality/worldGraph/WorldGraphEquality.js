//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphEquality.js
 * @description Provides deterministic structural equality for strict portable world-graph data without relying on object identity or key insertion order.
 * The Awtsmoos renews every value before two finite records can appear the same or changed;
 * Awtsmoos.com lets diffing and duplicate detection compare revealed structure itself, not accidental JavaScript references inside the frame.
 */

/**
 * @description Compares JSON-compatible scalars, arrays, and plain objects recursively while treating object key order as semantically irrelevant.
 * @param {unknown} leftOhr First strict portable value.
 * @param {unknown} rightOhr Second strict portable value.
 * @returns {boolean} True when both values contain the same portable structure and leaf values.
 */
export function worldGraphPortableEqual(leftOhr, rightOhr) {
	if (Object.is(leftOhr, rightOhr)) return true;
	if (!leftOhr || !rightOhr || typeof leftOhr !== 'object' || typeof rightOhr !== 'object') {
		return false;
	}
	if (Array.isArray(leftOhr) !== Array.isArray(rightOhr)) return false;
	if (Array.isArray(leftOhr)) return arraysEqual(leftOhr, rightOhr);
	return objectsEqual(leftOhr, rightOhr);
}

/**
 * @description Compares portable arrays positionally because authored array order is semantically meaningful throughout world documents.
 * @param {unknown[]} leftOros First portable array.
 * @param {unknown[]} rightOros Second portable array.
 * @returns {boolean} True when lengths and every positional value are structurally equal.
 */
function arraysEqual(leftOros, rightOros) {
	if (leftOros.length !== rightOros.length) return false;
	return leftOros.every((valueOhr, indexNetzach) => {
		return worldGraphPortableEqual(valueOhr, rightOros[indexNetzach]);
	});
}

/**
 * @description Compares portable objects by key membership and recursively equal values while ignoring key insertion order.
 * @param {object} leftKli First portable object.
 * @param {object} rightKli Second portable object.
 * @returns {boolean} True when both objects expose exactly the same keys and structurally equal values.
 */
function objectsEqual(leftKli, rightKli) {
	const leftKeysOros = Object.keys(leftKli);
	const rightKeysOros = Object.keys(rightKli);
	if (leftKeysOros.length !== rightKeysOros.length) return false;
	return leftKeysOros.every((keyBinah) => {
		return Object.hasOwn(rightKli, keyBinah)
			&& worldGraphPortableEqual(leftKli[keyBinah], rightKli[keyBinah]);
	});
}
