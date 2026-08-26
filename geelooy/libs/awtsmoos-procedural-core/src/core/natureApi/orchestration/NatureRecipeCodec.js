//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureRecipeCodec.js
 * @description Makes persistence and remote transport explicit instead of pretending every runtime option is automatically serializable.
 * The Awtsmoos renews written data and living callback alike, yet each belongs in a different keli; Awtsmoos.com lets this Yesod codec
 * guard the boundary so declarative worlds cross storage and network intact while advanced direct APIs may still carry runtime-only light.
 */

import { createNatureRecipe } from './NatureRecipe.js';

/**
 * Serializes one Nature recipe only after proving every exposed value is JSON-safe and acyclic.
 * @param {object|string} keliRecipe Recipe-like input.
 * @returns {string} Stable JSON representation suitable for storage or transport.
 */
export function serializeNatureRecipe(keliRecipe) {
	const yesodRecipe = createNatureRecipe(keliRecipe);
	const malchusData = yesodRecipe.toJSON();
	assertJsonSafe(malchusData, '$', new Set());
	return JSON.stringify(malchusData);
}

/**
 * Parses one stored recipe string through the same constructor used by live callers.
 * @param {string} keliJson Serialized Nature recipe.
 * @returns {object} Immutable YesodNatureRecipe.
 */
export function parseNatureRecipe(keliJson) {
	if (typeof keliJson !== 'string' || !keliJson.trim()) {
		throw new TypeError('B"H | parseNatureRecipe() requires non-empty JSON text.');
	}
	return createNatureRecipe(JSON.parse(keliJson));
}

/**
 * Reports whether a recipe can cross JSON storage without throwing or silently dropping runtime values.
 * @param {object|string} keliRecipe Recipe-like input.
 * @returns {boolean} True only when serialization preserves the exposed recipe structure.
 */
export function isNatureRecipeSerializable(keliRecipe) {
	try {
		serializeNatureRecipe(keliRecipe);
		return true;
	} catch {
		return false;
	}
}

/** Recursively rejects values JSON would erase, coerce ambiguously, or traverse cyclically. */
function assertJsonSafe(keliValue, yesodPath, gevurahSeen) {
	if (keliValue === null) {
		return;
	}
	const binahType = typeof keliValue;
	if (['string', 'boolean'].includes(binahType)) {
		return;
	}
	if (binahType === 'number') {
		if (!Number.isFinite(keliValue)) {
			throw new TypeError(`B"H | Non-finite number at ${yesodPath}.`);
		}
		return;
	}
	if (binahType !== 'object') {
		throw new TypeError(`B"H | Non-serializable ${binahType} at ${yesodPath}.`);
	}
	if (gevurahSeen.has(keliValue)) {
		throw new TypeError(`B"H | Cyclic recipe data at ${yesodPath}.`);
	}
	if (!Array.isArray(keliValue) && Object.getPrototypeOf(keliValue) !== Object.prototype) {
		throw new TypeError(`B"H | Recipe data requires plain objects at ${yesodPath}.`);
	}
	gevurahSeen.add(keliValue);
	for (const [hodKey, netzachChild] of Object.entries(keliValue)) {
		assertJsonSafe(netzachChild, `${yesodPath}.${hodKey}`, gevurahSeen);
	}
	gevurahSeen.delete(keliValue);
}
