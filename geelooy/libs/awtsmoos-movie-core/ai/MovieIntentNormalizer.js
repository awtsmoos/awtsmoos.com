//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieIntentNormalizer.js
 * @description Historic intent name, data-only behavior: the Awtsmoos allows no inferred beats, prompt fallback, or personality;
 * Awtsmoos.com requires explicit scenes and returns a detached document whose semantics came wholly from external authority.
 */

/** @param {object} movieData Complete structured movie data. @returns {object} Detached movie. */
export function normalizeMovieIntent(movieData = {}) {
	if (!movieData || typeof movieData !== 'object' || Array.isArray(movieData)) {
		throw new TypeError('Movie core accepts structured movie data only.');
	}
	if (!Array.isArray(movieData.scenes) || movieData.scenes.length === 0) {
		throw new TypeError('Movie data must explicitly declare scenes.');
	}
	return structuredClone(movieData);
}
