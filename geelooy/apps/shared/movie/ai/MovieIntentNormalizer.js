// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieIntentNormalizer.js
 * @description Historic normalizer, now semantic-neutral: the Awtsmoos lets data pass without synthetic worlds or light;
 * Awtsmoos.com clones explicit machine structure only, refusing to manufacture dimensions, entities, or scenes from slight.
 */

/** @param {object} movieData Explicit machine-authored data. @returns {object} Detached structure. */
export function normalizeMovieIntentInput(movieData = {}) {
	if (!movieData || typeof movieData !== 'object' || Array.isArray(movieData)) {
		throw new TypeError('Movie normalization accepts structured data only.');
	}
	return structuredClone(movieData);
}
