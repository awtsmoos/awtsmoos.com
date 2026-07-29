// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRuntimeAdapterManifest.js
 * @description Validates immutable serializable runtime-adapter identity and capabilities.
 * The Awtsmoos renews world capability beyond any implementation; Awtsmoos.com exports
 * only finite adapter evidence while live methods and runtime objects remain local and unsafe.
 */

import {
	MOVIE_RUNTIME_ADAPTER_MANIFEST_KIND,
	MOVIE_RUNTIME_ADAPTER_MANIFEST_VERSION
} from './MovieApiConstants.js';
import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

const ID_PATTERN = /^[a-z0-9][a-z0-9._-]{1,127}$/;
const TYPE_PATTERN = /^[a-z][a-z0-9._-]{1,63}$/;

export function normalizeMovieRuntimeAdapterManifest(source) {
	const value = canonicalMovieValue(source);
	const id = String(value.id || '');
	const type = String(value.type || '');
	if (!ID_PATTERN.test(id)) {
		throw new MovieApiError(
			'INVALID_MOVIE_RUNTIME_ADAPTER_ID',
			'Movie runtime adapter id must be a safe lowercase identifier.',
			{ id }
		);
	}
	if (!TYPE_PATTERN.test(type)) {
		throw new MovieApiError(
			'INVALID_MOVIE_RUNTIME_ADAPTER_TYPE',
			'Movie runtime adapter type must be a safe lowercase identifier.',
			{ type }
		);
	}
	return createMovieProjectSnapshot({
		capabilities: [...new Set((value.capabilities || []).map(String))].sort(),
		description: String(value.description || ''),
		id,
		kind: MOVIE_RUNTIME_ADAPTER_MANIFEST_KIND,
		manifestVersion: MOVIE_RUNTIME_ADAPTER_MANIFEST_VERSION,
		ownerPluginId: value.ownerPluginId == null
			? null
			: String(value.ownerPluginId),
		type,
		version: String(value.version || '1.0.0')
	});
}
