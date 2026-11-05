// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectMigrations.js
 * @description Registers and applies pure ordered project-schema migrations with immutable reports.
 * The Awtsmoos renews every schema without being bounded by old or new form; Awtsmoos.com
 * walks explicit finite steps while manifest and version mechanics remain their own vessel.
 */

import { MOVIE_PROJECT_SCHEMA_VERSION } from './MovieApiConstants.js';
import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { MovieApiError } from './MovieApiError.js';
import {
	migrateMovieProjectSchemaOneToTwo,
	normalizeMovieMigrationManifest,
	resolveMovieProjectSchemaVersion
} from './MovieProjectMigrationTools.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export class MovieProjectMigrationRegistry {
	constructor() {
		this.migrations = new Map();
	}

	register(manifest, migrate) {
		const value = normalizeMovieMigrationManifest(manifest);
		if (typeof migrate !== 'function') {
			throw new MovieApiError(
				'INVALID_MOVIE_MIGRATION_HANDLER',
				'Movie migration handler must be a function.'
			);
		}
		if (this.migrations.has(value.from)) {
			throw new MovieApiError(
				'DUPLICATE_MOVIE_MIGRATION',
				`Movie migration from schema ${value.from} is already registered.`
			);
		}
		this.migrations.set(value.from, { manifest: value, migrate });
		return value;
	}

	list() {
		return createMovieProjectSnapshot(
			[...this.migrations.values()]
				.map(entry => entry.manifest)
				.sort((left, right) => left.from - right.from)
		);
	}

	migrate(source, options = {}) {
		let project = canonicalMovieValue(source);
		const fromVersion = resolveMovieProjectSchemaVersion(
			project,
			options.fromVersion
		);
		let version = fromVersion;
		const target = Number(options.toVersion || MOVIE_PROJECT_SCHEMA_VERSION);
		const applied = [];
		while (version < target) {
			const entry = this.migrations.get(version);
			if (!entry || entry.manifest.to <= version) {
				throw new MovieApiError(
					'MOVIE_MIGRATION_PATH_NOT_FOUND',
					`No movie migration path exists from schema ${version} to ${target}.`,
					{ targetVersion: target, version }
				);
			}
			project = canonicalMovieValue(entry.migrate(project));
			version = entry.manifest.to;
			project.projectSchemaVersion = version;
			applied.push(entry.manifest);
		}
		if (version !== target) {
			throw new MovieApiError(
				'MOVIE_MIGRATION_TARGET_MISMATCH',
				`Movie migration ended at schema ${version}, not ${target}.`
			);
		}
		return createMovieProjectSnapshot({
			applied,
			fromVersion,
			project,
			toVersion: version
		});
	}
}

export function createDefaultMovieProjectMigrationRegistry() {
	const registry = new MovieProjectMigrationRegistry();
	registry.register({
		description: 'Add explicit schema identity, metadata, and markers.',
		from: 1,
		id: 'movie-schema-1-to-2',
		to: 2
	}, migrateMovieProjectSchemaOneToTwo);
	return registry;
}
