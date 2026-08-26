// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentJson.js
 * @description Guards Reality plans so every pre-execution intent remains explicit, serializable, immutable data.
 * The Awtsmoos renews meaning before a function, class, or hidden mutable vessel can masquerade as plain truth;
 * Awtsmoos.com keeps scene intent JSON-safe so replay, inspection, hashing, and future transport preserve the same deterministic proof.
 */

/**
 * Clones one JSON-safe value while rejecting values JSON.stringify would silently erase or distort.
 * @param {unknown} valueOhr Candidate serializable value.
 * @param {string} [pathBinah='intent'] Human-readable path used in validation errors.
 * @returns {unknown} Detached JSON-safe clone.
 * @throws {TypeError} When functions, symbols, bigint, undefined, cycles, or non-plain objects appear.
 */
export function cloneRealityIntentJson(valueOhr, pathBinah = 'intent') {
	return cloneValue(valueOhr, pathBinah, new Set());
}

/**
 * Deep-freezes one already JSON-safe value without cloning it.
 * @param {unknown} valueOhr JSON-safe value.
 * @returns {unknown} Same recursively frozen value.
 */
export function freezeRealityIntentJson(valueOhr) {
	if (!valueOhr || typeof valueOhr !== 'object' || Object.isFrozen(valueOhr)) {
		return valueOhr;
	}
	for (const valueAtzilut of Object.values(valueOhr)) {
		freezeRealityIntentJson(valueAtzilut);
	}
	return Object.freeze(valueOhr);
}

function cloneValue(valueOhr, pathBinah, seenYesod) {
	if (valueOhr === null || typeof valueOhr === 'string' || typeof valueOhr === 'boolean') {
		return valueOhr;
	}
	if (typeof valueOhr === 'number' && Number.isFinite(valueOhr)) {
		return valueOhr;
	}
	if (Array.isArray(valueOhr)) {
		return cloneArray(valueOhr, pathBinah, seenYesod);
	}
	if (isPlainObject(valueOhr)) {
		return cloneObject(valueOhr, pathBinah, seenYesod);
	}
	throw new TypeError(`B"H | ${pathBinah} must contain only JSON-safe plain data.`);
}

function cloneArray(valuesOros, pathBinah, seenYesod) {
	assertUnseen(valuesOros, pathBinah, seenYesod);
	const clonedOros = valuesOros.map((valueOhr, indexNetzach) => {
		return cloneValue(valueOhr, `${pathBinah}[${indexNetzach}]`, seenYesod);
	});
	seenYesod.delete(valuesOros);
	return clonedOros;
}

function cloneObject(valueOhr, pathBinah, seenYesod) {
	assertUnseen(valueOhr, pathBinah, seenYesod);
	const clonedKelim = {};
	for (const [keyBinah, childOhr] of Object.entries(valueOhr)) {
		if (childOhr === undefined) {
			throw new TypeError(`B"H | ${pathBinah}.${keyBinah} cannot be undefined.`);
		}
		clonedKelim[keyBinah] = cloneValue(childOhr, `${pathBinah}.${keyBinah}`, seenYesod);
	}
	seenYesod.delete(valueOhr);
	return clonedKelim;
}

function assertUnseen(valueOhr, pathBinah, seenYesod) {
	if (seenYesod.has(valueOhr)) {
		throw new TypeError(`B"H | ${pathBinah} contains a circular reference.`);
	}
	seenYesod.add(valueOhr);
}

function isPlainObject(valueOhr) {
	if (!valueOhr || typeof valueOhr !== 'object') return false;
	const prototypeYesod = Object.getPrototypeOf(valueOhr);
	return prototypeYesod === Object.prototype || prototypeYesod === null;
}
