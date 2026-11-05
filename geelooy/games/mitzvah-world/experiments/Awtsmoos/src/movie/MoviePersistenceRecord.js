// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePersistenceRecord.js
 * @description Creates and verifies checksummed project, UI, metadata, and timestamp records.
 * The Awtsmoos renews memory without being held by it; Awtsmoos.com gives storage one
 * nested verified project envelope and one bounded interface document, never live session state.
 */

import {
	MOVIE_PERSISTENCE_RECORD_KIND,
	MOVIE_PERSISTENCE_RECORD_VERSION
} from './MovieApiConstants.js';
import { MovieApiError } from './MovieApiError.js';
import {
	canonicalMovieValue,
	movieJsonChecksum,
	parseCanonicalMovieJson,
	stringifyCanonicalMovieJson
} from './MovieCanonicalJson.js';
import {
	createMovieProjectEnvelope,
	parseMovieProjectEnvelope
} from './MovieProjectEnvelope.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { normalizeMovieStudioPreferences } from './MovieStudioPreferenceState.js';

export function createMoviePersistenceRecord(project, ui, options = {}) {
	const core = canonicalMovieValue({
		key: String(options.key || 'default'),
		kind: MOVIE_PERSISTENCE_RECORD_KIND,
		metadata: options.metadata || {},
		project: createMovieProjectEnvelope(project, {
			exportedAt: options.savedAt,
			metadata: options.projectMetadata || {},
			revision: options.revision || 0
		}),
		recordVersion: MOVIE_PERSISTENCE_RECORD_VERSION,
		savedAt: options.savedAt || new Date().toISOString(),
		ui: normalizeMovieStudioPreferences(ui)
	});
	return createMovieProjectSnapshot({
		...core,
		checksum: movieJsonChecksum(stringifyCanonicalMovieJson(core))
	});
}

export function parseMoviePersistenceRecord(source) {
	const record = typeof source === 'string'
		? parseCanonicalMovieJson(source, 'movie persistence record')
		: canonicalMovieValue(source);
	validateHeader(record);
	const { checksum, ...core } = record;
	const actual = movieJsonChecksum(stringifyCanonicalMovieJson(core));
	if (actual !== checksum) {
		throw new MovieApiError(
			'MOVIE_PERSISTENCE_CHECKSUM_MISMATCH',
			'Movie persistence record checksum does not match its contents.',
			{ actualChecksum: actual, expectedChecksum: checksum }
		);
	}
	const project = parseMovieProjectEnvelope(record.project);
	return createMovieProjectSnapshot({
		...record,
		project,
		ui: normalizeMovieStudioPreferences(record.ui)
	});
}

export function serializeMoviePersistenceRecord(project, ui, options = {}) {
	return stringifyCanonicalMovieJson(
		createMoviePersistenceRecord(project, ui, options)
	);
}

function validateHeader(record) {
	if (record?.kind !== MOVIE_PERSISTENCE_RECORD_KIND) {
		throw new MovieApiError(
			'MOVIE_PERSISTENCE_KIND_MISMATCH',
			`Expected ${MOVIE_PERSISTENCE_RECORD_KIND}.`,
			{ actualKind: record?.kind || null }
		);
	}
	if (Number(record.recordVersion) !== MOVIE_PERSISTENCE_RECORD_VERSION) {
		throw new MovieApiError(
			'UNSUPPORTED_MOVIE_PERSISTENCE_VERSION',
			`Unsupported persistence record version ${record.recordVersion}.`
		);
	}
	if (!record.key || typeof record.key !== 'string') {
		throw new MovieApiError(
			'INVALID_MOVIE_PERSISTENCE_KEY',
			'Movie persistence record requires a string key.'
		);
	}
}
