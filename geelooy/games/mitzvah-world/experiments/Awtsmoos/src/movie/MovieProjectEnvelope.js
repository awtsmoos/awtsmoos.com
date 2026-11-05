// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectEnvelope.js
 * @description Exports and imports checksummed versioned canonical movie project envelopes.
 * The Awtsmoos renews story and signature before transmission; Awtsmoos.com lets every
 * agent verify kind, schema, revision, metadata, checksum, and project before installation.
 */

import {
	MOVIE_API_VERSION,
	MOVIE_ENVELOPE_VERSION,
	MOVIE_PROJECT_ENVELOPE_KIND,
	MOVIE_PROJECT_SCHEMA_VERSION
} from './MovieApiConstants.js';
import { MovieApiError } from './MovieApiError.js';
import {
	canonicalMovieValue,
	movieJsonChecksum,
	parseCanonicalMovieJson,
	stringifyCanonicalMovieJson
} from './MovieCanonicalJson.js';
import { normalizeMovieProject } from './MovieProjectNormalizer.js';
import { validateMovieProject } from './MovieProjectValidator.js';

export function createMovieProjectEnvelope(project, options = {}) {
	const canonicalProject = validProject(project);
	const projectText = stringifyCanonicalMovieJson(canonicalProject);
	return canonicalMovieValue({
		apiVersion: MOVIE_API_VERSION,
		checksum: movieJsonChecksum(projectText),
		envelopeVersion: MOVIE_ENVELOPE_VERSION,
		exportedAt: options.exportedAt || new Date().toISOString(),
		kind: MOVIE_PROJECT_ENVELOPE_KIND,
		metadata: options.metadata || {},
		project: canonicalProject,
		projectSchemaVersion: MOVIE_PROJECT_SCHEMA_VERSION,
		revision: revision(options.revision)
	});
}

export function serializeMovieProjectEnvelope(project, options = {}) {
	return stringifyCanonicalMovieJson(createMovieProjectEnvelope(project, options));
}

export function parseMovieProjectEnvelope(source) {
	const envelope = typeof source === 'string'
		? parseCanonicalMovieJson(source, 'movie project envelope')
		: canonicalMovieValue(source);
	validateEnvelopeHeader(envelope);
	const project = validProject(envelope.project);
	const checksum = movieJsonChecksum(stringifyCanonicalMovieJson(project));
	if (checksum !== envelope.checksum) {
		throw new MovieApiError(
			'MOVIE_ENVELOPE_CHECKSUM_MISMATCH',
			'Movie project envelope checksum does not match its project.',
			{ actualChecksum: checksum, expectedChecksum: envelope.checksum }
		);
	}
	return {
		...envelope,
		project
	};
}

function validateEnvelopeHeader(envelope) {
	if (envelope?.kind !== MOVIE_PROJECT_ENVELOPE_KIND) {
		throw new MovieApiError(
			'MOVIE_ENVELOPE_KIND_MISMATCH',
			`Expected ${MOVIE_PROJECT_ENVELOPE_KIND}.`,
			{ actualKind: envelope?.kind || null }
		);
	}
	if (Number(envelope.envelopeVersion) !== MOVIE_ENVELOPE_VERSION) {
		throw new MovieApiError(
			'UNSUPPORTED_MOVIE_ENVELOPE_VERSION',
			`Unsupported movie envelope version ${envelope.envelopeVersion}.`
		);
	}
	if (Number(envelope.projectSchemaVersion) !== MOVIE_PROJECT_SCHEMA_VERSION) {
		throw new MovieApiError(
			'UNSUPPORTED_MOVIE_PROJECT_SCHEMA',
			`Unsupported movie project schema ${envelope.projectSchemaVersion}.`
		);
	}
	if (!Number.isSafeInteger(envelope.revision) || envelope.revision < 0) {
		throw new MovieApiError(
			'INVALID_MOVIE_REVISION',
			'Movie envelope revision must be a non-negative safe integer.'
		);
	}
}

function validProject(source) {
	const project = normalizeMovieProject(canonicalMovieValue(source));
	validateMovieProject(project);
	return canonicalMovieValue(project);
}

function revision(value) {
	const number = Number(value || 0);
	if (!Number.isSafeInteger(number) || number < 0) {
		throw new MovieApiError(
			'INVALID_MOVIE_REVISION',
			'Movie revision must be a non-negative safe integer.'
		);
	}
	return number;
}
