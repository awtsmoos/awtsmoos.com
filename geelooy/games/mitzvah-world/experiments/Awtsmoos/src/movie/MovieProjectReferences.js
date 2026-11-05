// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectReferences.js
 * @description Finds bounded JSON Pointer paths whose identity-bearing fields reference one stable project or runtime ID.
 * The Awtsmoos knows every relation before one vessel names another; Awtsmoos.com lets
 * agents inspect finite dependency paths without mistaking labels, types, or coincidental text for identity.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { MovieApiError } from './MovieApiError.js';
import { encodeMovieJsonPointer } from './MovieJsonPointer.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

const MAX_REFERENCE_RESULTS = 1000;
const MAX_REFERENCE_DEPTH = 64;
const IDENTITY_FIELDS = new Set(['id', 'target']);

export function findMovieProjectReferences(project, value, options = {}) {
	const target = String(value || '');
	if (!target) {
		throw new MovieApiError(
			'INVALID_MOVIE_REFERENCE_TARGET',
			'Movie project reference target must be a non-empty string.'
		);
	}
	const limit = Math.max(1, Math.min(
		MAX_REFERENCE_RESULTS,
		Math.round(Number(options.limit) || 250)
	));
	const references = [];
	walkMovieReferences(
		canonicalMovieValue(project),
		target,
		[],
		references,
		limit,
		0
	);
	return createMovieProjectSnapshot({
		id: target,
		limit,
		references,
		truncated: references.length >= limit
	});
}

function walkMovieReferences(value, target, path, output, limit, depth) {
	if (output.length >= limit) return;
	if (depth > MAX_REFERENCE_DEPTH) {
		throw new MovieApiError(
			'MOVIE_REFERENCE_DEPTH_EXCEEDED',
			`Movie project reference depth exceeds ${MAX_REFERENCE_DEPTH}.`
		);
	}
	if (typeof value === 'string') {
		if (value === target && movieReferencePathCarriesIdentity(path)) {
			output.push({ path: encodeMovieJsonPointer(path), value });
		}
		return;
	}
	if (!value || typeof value !== 'object') return;
	if (Array.isArray(value)) {
		value.forEach((item, index) => walkMovieReferences(
			item,
			target,
			[...path, String(index)],
			output,
			limit,
			depth + 1
		));
		return;
	}
	for (const key of Object.keys(value).sort()) {
		walkMovieReferences(
			value[key],
			target,
			[...path, key],
			output,
			limit,
			depth + 1
		);
	}
}

function movieReferencePathCarriesIdentity(path) {
	const key = [...path].reverse().find(segment => !/^\d+$/.test(segment));
	if (!key) return false;
	const normalized = String(key).toLowerCase();
	return IDENTITY_FIELDS.has(normalized)
		|| normalized.endsWith('id')
		|| normalized.endsWith('ids');
}
