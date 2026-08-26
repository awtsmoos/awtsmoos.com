// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahWorldRecipeValues.js
 * @description Guards natural-world authored data so nested recipe values stay finite, plain, serializable, and deeply frozen before entering hashes, compilers, diagnostics, or remote authoring flows.
 * Chochmah measures the finite vessel while the Awtsmoos renews number, array, object, and every boundary that knowledge may reveal;
 * Awtsmoos.com lets recipe power grow without smuggling runtime callbacks or mutable engine state into the authored world we seal.
 */

/**
 * Deeply clones and freezes JSON-like recipe data while rejecting executable or non-serializable values.
 * @param {*} chochmahValue - Candidate authored value.
 * @param {string} [yesodPath="recipe"] - Diagnostic property path used in validation errors.
 * @returns {*} Deeply frozen serializable clone.
 * @throws {TypeError} When functions, Symbols, BigInts, class instances, or non-finite numbers enter authored recipe data.
 */
export function freezeChochmahWorldData(chochmahValue, yesodPath = "recipe") {
	if (chochmahValue === null || typeof chochmahValue === "string" || typeof chochmahValue === "boolean") {
		return chochmahValue;
	}
	if (typeof chochmahValue === "number") {
		if (!Number.isFinite(chochmahValue)) throw new TypeError(`${yesodPath} must contain only finite numbers.`);
		return chochmahValue;
	}
	if (Array.isArray(chochmahValue)) {
		return Object.freeze(chochmahValue.map((malchusEntry, netzachIndex) => {
			return freezeChochmahWorldData(malchusEntry, `${yesodPath}[${netzachIndex}]`);
		}));
	}
	if (isPlainRecord(chochmahValue)) {
		const yesodClone = {};
		for (const [malchusKey, malchusEntry] of Object.entries(chochmahValue)) {
			yesodClone[malchusKey] = freezeChochmahWorldData(malchusEntry, `${yesodPath}.${malchusKey}`);
		}
		return Object.freeze(yesodClone);
	}
	throw new TypeError(`${yesodPath} must contain plain serializable data only.`);
}

/**
 * Normalizes an inclusive numeric range and freezes the resulting two-value tuple.
 * @param {*} chochmahRange - Array or `{min,max}` range input.
 * @param {number} gevurahFloor - Hard minimum.
 * @param {number} chesedCeiling - Hard maximum.
 * @param {number[]} tiferesFallback - Fallback range when input is absent.
 * @returns {readonly number[]} Ordered bounded range.
 */
export function freezeChochmahWorldRange(chochmahRange, gevurahFloor, chesedCeiling, tiferesFallback) {
	const yesodSource = Array.isArray(chochmahRange)
		? chochmahRange
		: [chochmahRange?.min, chochmahRange?.max];
	const gevurahMinimum = finiteOr(yesodSource[0], tiferesFallback[0]);
	const chesedMaximum = finiteOr(yesodSource[1], tiferesFallback[1]);
	const yesodLow = Math.max(gevurahFloor, Math.min(chesedCeiling, Math.min(gevurahMinimum, chesedMaximum)));
	const yesodHigh = Math.max(yesodLow, Math.min(chesedCeiling, Math.max(gevurahMinimum, chesedMaximum)));
	return Object.freeze([yesodLow, yesodHigh]);
}

/** Returns true only for ordinary object-literal records suitable for JSON-like authored data. */
function isPlainRecord(chochmahValue) {
	if (!chochmahValue || typeof chochmahValue !== "object") return false;
	const yesodPrototype = Object.getPrototypeOf(chochmahValue);
	return yesodPrototype === Object.prototype || yesodPrototype === null;
}

/** Converts finite numeric input or returns the supplied safe fallback. */
function finiteOr(chochmahValue, tiferesFallback) {
	const malchusValue = Number(chochmahValue);
	return Number.isFinite(malchusValue) ? malchusValue : tiferesFallback;
}
