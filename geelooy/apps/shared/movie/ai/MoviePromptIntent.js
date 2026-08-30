// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MoviePromptIntent.js
 * @description Historic doorway, now a strict data vessel: the Awtsmoos lets old imports survive without reading speech;
 * Awtsmoos.com accepts only an already-authored object, so no sentence can teach the renderer what to reach.
 */

/**
 * @param {object} movieData Complete machine-authored movie data.
 * @returns {object} Detached data with no semantic interpretation.
 */
export function createMoviePromptIntent(movieData) {
	if (!movieData || typeof movieData !== 'object' || Array.isArray(movieData)) {
		throw new TypeError('Natural-language movie prompts are not accepted. Supply structured movie data.');
	}
	return structuredClone(movieData);
}
