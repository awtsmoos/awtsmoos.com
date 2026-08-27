// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectQueryContract.js
 * @description Validates bounded project query entities, filters, time ranges, text, and limits.
 * The Awtsmoos knows every path before a question is formed; Awtsmoos.com keeps each
 * finite query explicit so agents cannot turn discovery into unbounded traversal or mutation.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

const MAX_QUERY_RESULTS = 500;
const ENTITY_TYPES = new Set(['all', 'clip', 'track']);

export function normalizeMovieProjectQuery(source = {}) {
	const value = canonicalMovieValue(source || {});
	const entity = String(value.entity || 'all');
	if (!ENTITY_TYPES.has(entity)) {
		throw new MovieApiError(
			'INVALID_MOVIE_PROJECT_QUERY_ENTITY',
			`Movie project query entity ${entity} is unsupported.`
		);
	}
	return createMovieProjectSnapshot({
		clipId: optionalString(value.clipId),
		entity,
		limit: boundedMovieQueryLimit(value.limit),
		target: optionalString(value.target),
		text: optionalString(value.text)?.toLowerCase() || null,
		time: normalizeMovieQueryTime(value.time),
		trackId: optionalString(value.trackId),
		type: optionalString(value.type)
	});
}

function boundedMovieQueryLimit(value) {
	return Math.max(1, Math.min(
		MAX_QUERY_RESULTS,
		Math.round(Number(value) || 100)
	));
}

function normalizeMovieQueryTime(source) {
	if (source == null) return null;
	const start = Number(source.start);
	const end = Number(source.end);
	if (!Number.isFinite(start) || !Number.isFinite(end)) {
		throw new MovieApiError(
			'INVALID_MOVIE_PROJECT_QUERY_TIME',
			'Movie project query time requires finite start and end.'
		);
	}
	return {
		end: Math.max(start, end),
		start: Math.min(start, end)
	};
}

function optionalString(value) {
	return value == null || value === '' ? null : String(value);
}
