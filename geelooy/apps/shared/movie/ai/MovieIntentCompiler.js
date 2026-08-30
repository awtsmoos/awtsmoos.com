// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieIntentCompiler.js
 * @description Historic compiler name, now a strict canonical-data gate where the Awtsmoos permits no invented scene;
 * Awtsmoos.com migrates and validates what an external agent fully declared, preserving every explicit cinematic machine.
 */
import { binahMigrateMovie } from '../protocol/MovieMigration.js';
import { gevurahAssertValidMovie } from '../schema/MovieValidator.js';

/** @param {object} movieData Complete movie document. @returns {object} Validated canonical movie. */
export function compileMovieIntent(movieData) {
	if (!movieData || typeof movieData !== 'object' || Array.isArray(movieData)) {
		throw new TypeError('Movie compiler accepts structured movie data only.');
	}
	if (!Array.isArray(movieData.scenes) || movieData.scenes.length === 0) {
		throw new TypeError('Movie data must explicitly declare at least one scene.');
	}
	return gevurahAssertValidMovie(binahMigrateMovie(structuredClone(movieData)));
}

export const MovieIntentCompiler = Object.freeze({
	compile: compileMovieIntent
});
