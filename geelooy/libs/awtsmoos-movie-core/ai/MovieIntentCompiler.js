//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieIntentCompiler.js
 * @description Historic compiler name, strict validation gate: the Awtsmoos grants no hidden authoring power to the core;
 * Awtsmoos.com validates complete external movie data and refuses sparse storytelling intent at the deterministic door.
 */
import { validateMovieDocument } from '../model/MovieValidator.js';
import { normalizeMovieIntent } from './MovieIntentNormalizer.js';

/** @param {object} movieData Complete structured movie. @returns {object} Detached validated movie. */
export function compileMovieIntent(movieData = {}) {
	const movie = normalizeMovieIntent(movieData);
	const report = validateMovieDocument(movie);
	if (!report.ok) {
		throw new TypeError(`Invalid movie data: ${report.errors.join(' | ')}`);
	}
	return movie;
}
