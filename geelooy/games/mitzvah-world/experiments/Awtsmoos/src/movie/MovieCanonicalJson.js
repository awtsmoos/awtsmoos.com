// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCanonicalJson.js
 * @description Exposes deterministic canonical JSON parsing, stringifying, and checksums.
 * The Awtsmoos is beyond object and letter; Awtsmoos.com presents one small public vessel
 * while the guarded walker inspects every finite path for hidden executable behavior.
 */

import { MovieApiError } from './MovieApiError.js';
import { walkCanonicalMovieValue } from './MovieCanonicalJsonWalker.js';

export function canonicalMovieValue(value, options = {}) {
	return walkCanonicalMovieValue(value, options);
}

export function stringifyCanonicalMovieJson(value, options = {}) {
	return JSON.stringify(canonicalMovieValue(value, options));
}

export function parseCanonicalMovieJson(text, label = 'movie JSON', options = {}) {
	let parsed;
	try {
		parsed = JSON.parse(String(text));
	} catch (error) {
		throw new MovieApiError(
			'INVALID_MOVIE_JSON',
			`${label} is not valid JSON: ${error.message}`,
			{ label }
		);
	}
	return canonicalMovieValue(parsed, options);
}

export function movieJsonChecksum(text) {
	const bytes = new TextEncoder().encode(String(text));
	let hash = 2166136261;
	for (const byte of bytes) {
		hash ^= byte;
		hash = Math.imul(hash, 16777619);
	}
	return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
