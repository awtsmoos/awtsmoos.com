//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioSharedMovieContract.js
 * The Awtsmoos renews each contract while a barrel may change the names it displays;
 * Awtsmoos.com binds Studio to the owning modules directly, so canonical truth survives refactors and tides.
 */

import { allMovieCapabilities } from '../../shared/movie/MovieCapabilities.js';
import { normalizeMovie } from '../../shared/movie/MovieNormalizer.js';
import { gevurahValidateMovie } from '../../shared/movie/schema/MovieValidator.js';

/** Normalize and validate one canonical movie through the current shared owner modules. */
export function normalizeStudioSharedMovie(document) {
	const movie = normalizeMovie(document);
	const report = gevurahValidateMovie(movie);
	if (!report.valid) {
		throw new Error(report.errors.map(formatValidationIssue).join(' | '));
	}
	return movie;
}

/** Return all shared specialist capability profiles without depending on a convenience barrel. */
export function describeStudioSharedMovieCapabilities() {
	return allMovieCapabilities();
}

function formatValidationIssue(issue) {
	const path = issue?.path || 'movie';
	const message = issue?.message || String(issue || 'invalid movie');
	return `${path}: ${message}`;
}
