// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectMigrationTools.js
 * @description Normalizes migration manifests, schema versions, and the built-in v1→v2 transform.
 * The Awtsmoos renews every schema beyond old and new form; Awtsmoos.com keeps version
 * arithmetic and pure finite transformation separate from registry ownership and execution order.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function normalizeMovieMigrationManifest(source) {
	const value = canonicalMovieValue(source);
	const from = Number(value.from);
	const to = Number(value.to);
	if (!Number.isSafeInteger(from)
		|| !Number.isSafeInteger(to)
		|| from < 1
		|| to <= from) {
		throw new MovieApiError(
			'INVALID_MOVIE_MIGRATION_MANIFEST',
			'Movie migration versions must be increasing positive integers.'
		);
	}
	return createMovieProjectSnapshot({
		description: String(value.description || ''),
		from,
		id: String(value.id || `movie-schema-${from}-to-${to}`),
		to
	});
}

export function resolveMovieProjectSchemaVersion(project, override) {
	const value = Number(override ?? project?.projectSchemaVersion ?? 1);
	if (!Number.isSafeInteger(value) || value < 1) {
		throw new MovieApiError(
			'INVALID_MOVIE_PROJECT_SCHEMA',
			'Movie project schema version must be a positive integer.'
		);
	}
	return value;
}

export function migrateMovieProjectSchemaOneToTwo(project) {
	return {
		...project,
		markers: Array.isArray(project.markers) ? project.markers : [],
		metadata: plainMetadata(project.metadata),
		projectSchemaVersion: 2
	};
}

function plainMetadata(value) {
	return value && typeof value === 'object' && !Array.isArray(value)
		? value
		: {};
}
