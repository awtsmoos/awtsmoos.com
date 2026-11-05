// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePersistenceAdapterContract.js
 * @description Normalizes public adapter manifests and validates trusted local implementations.
 * The Awtsmoos renews name and deed without confusing either; Awtsmoos.com reveals
 * finite serializable capability while executable storage methods remain local and guarded.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

const REQUIRED_METHODS = Object.freeze([
	'list',
	'load',
	'remove',
	'save'
]);

export function normalizeMoviePersistenceManifest(source) {
	const value = canonicalMovieValue(source);
	if (!value?.id) {
		throw new MovieApiError(
			'INVALID_MOVIE_PERSISTENCE_MANIFEST',
			'Movie persistence adapter manifest requires an id.'
		);
	}
	return createMovieProjectSnapshot({
		description: String(value.description || ''),
		id: String(value.id),
		local: value.local !== false,
		persistent: Boolean(value.persistent),
		version: Number(value.version || 1)
	});
}

export function validateMoviePersistenceAdapter(adapter) {
	for (const method of REQUIRED_METHODS) {
		if (typeof adapter?.[method] === 'function') continue;
		throw new MovieApiError(
			'INVALID_MOVIE_PERSISTENCE_ADAPTER',
			`Movie persistence adapter requires ${method}().`,
			{ method }
		);
	}
	return adapter;
}
