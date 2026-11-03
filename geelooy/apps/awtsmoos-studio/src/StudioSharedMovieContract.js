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

/**
 * Lift the title into Studio's top-level movie.title holder and mirror it back
 * into canonical metadata.title. The shared factory keeps only metadata.title,
 * while Studio state, the header, and project storage all read movie.title —
 * without this lift a loaded movie's title never reaches the header. The lift
 * is applied by the session when a movie enters the editor, NOT inside
 * normalizeStudioSharedMovie: project storage round-trips must stay canonical.
 */
export function liftStudioMovieTitle(movie, document = movie) {
	const title = firstStudioTitle(movie?.title, document?.title, document?.metadata?.title, movie?.metadata?.title);
	if (!title) return movie;
	movie.title = title;
	movie.metadata = { ...(movie.metadata || {}), title };
	return movie;
}

function firstStudioTitle(...candidates) {
	for (const candidate of candidates) {
		const title = String(candidate ?? '').trim();
		if (title) return title;
	}
	return '';
}

function formatValidationIssue(issue) {
	const path = issue?.path || 'movie';
	const message = issue?.message || String(issue || 'invalid movie');
	return `${path}: ${message}`;
}
