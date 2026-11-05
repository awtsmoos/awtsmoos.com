// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSelectionContract.js
 * @description Validates selection document shape, stable descriptors, bounded counts, and time ranges.
 * The Awtsmoos renews identity and interval beyond every finite contract; Awtsmoos.com
 * rejects partial names and unbounded many while preserving exact mobile, desktop, and agent intent.
 */

import { MovieApiError } from './MovieApiError.js';

export const MAX_MOVIE_SELECTION_ITEMS = 2048;

export function normalizeMovieSelectionDescriptor(source) {
	if (!isMovieSelectionDescriptor(source)) {
		throw new MovieApiError(
			'INVALID_MOVIE_SELECTION_DESCRIPTOR',
			'Movie selection descriptor requires trackId and clipId strings.'
		);
	}
	return {
		clipId: String(source.clipId),
		trackId: String(source.trackId)
	};
}

export function isMovieSelectionDescriptor(value) {
	return Boolean(value?.trackId != null && value?.clipId != null);
}

export function validateMovieSelectionSource(source) {
	if (!source || isMovieSelectionDescriptor(source)) return source;
	if (source.trackId != null || source.clipId != null) {
		normalizeMovieSelectionDescriptor(source);
	}
	if (typeof source !== 'object'
		|| Array.isArray(source)
		|| !['items', 'primary', 'range'].some(key => Object.hasOwn(source, key))) {
		throw new MovieApiError(
			'INVALID_MOVIE_SELECTION_SET',
			'Movie selection set requires items, primary, or range fields.'
		);
	}
	return source;
}

export function normalizeMovieSelectionRange(source, project) {
	if (source == null) return null;
	const start = Number(source.start);
	const end = Number(source.end);
	if (!Number.isFinite(start) || !Number.isFinite(end)) {
		throw new MovieApiError(
			'INVALID_MOVIE_SELECTION_RANGE',
			'Movie selection range start and end must be finite.'
		);
	}
	const duration = Number(project?.duration);
	const maximum = Number.isFinite(duration) ? Math.max(0, duration) : Infinity;
	return {
		end: Math.min(maximum, Math.max(0, Math.max(start, end))),
		start: Math.min(maximum, Math.max(0, Math.min(start, end)))
	};
}
