// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProjectEnvelope.test.mjs
 * @description Proves deterministic checksummed project export, import, metadata, and tamper rejection.
 * The Awtsmoos renews story and signature before every crossing; Awtsmoos.com verifies
 * that agents receive one versioned document and cannot silently alter its canonical contents.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMovieProjectEnvelope,
	parseMovieProjectEnvelope,
	serializeMovieProjectEnvelope
} from '../../movie/MovieProjectEnvelope.js';

function project() {
	return {
		duration: 8,
		fps: 24,
		resolution: { height: 720, width: 1280 },
		title: 'שלום Movie',
		tracks: [{
			clips: [{ duration: 4, id: 'clip', start: 1 }],
			id: 'actors',
			target: 'player',
			type: 'actor'
		}]
	};
}

test('project envelope round trips canonical project and metadata', () => {
	const text = serializeMovieProjectEnvelope(project(), {
		exportedAt: '2026-07-28T00:00:00.000Z',
		metadata: { agent: 'test', requestId: 'abc' },
		revision: 7
	});
	const parsed = parseMovieProjectEnvelope(text);
	assert.equal(parsed.project.title, 'שלום Movie');
	assert.equal(parsed.project.tracks[0].clips[0].id, 'clip');
	assert.equal(parsed.metadata.agent, 'test');
	assert.equal(parsed.revision, 7);
	assert.equal(text, serializeMovieProjectEnvelope(parsed.project, {
		exportedAt: parsed.exportedAt,
		metadata: parsed.metadata,
		revision: parsed.revision
	}));
});

test('project envelope rejects checksum tampering', () => {
	const envelope = createMovieProjectEnvelope(project(), { revision: 2 });
	envelope.project.title = 'Tampered';
	assert.throws(() => parseMovieProjectEnvelope(envelope), error => (
		error.code === 'MOVIE_ENVELOPE_CHECKSUM_MISMATCH'
	));
});

test('project envelope rejects kind and schema mismatches', () => {
	const wrongKind = createMovieProjectEnvelope(project());
	wrongKind.kind = 'other';
	assert.throws(() => parseMovieProjectEnvelope(wrongKind), error => (
		error.code === 'MOVIE_ENVELOPE_KIND_MISMATCH'
	));
	const wrongSchema = createMovieProjectEnvelope(project());
	wrongSchema.projectSchemaVersion = 999;
	assert.throws(() => parseMovieProjectEnvelope(wrongSchema), error => (
		error.code === 'UNSUPPORTED_MOVIE_PROJECT_SCHEMA'
	));
});

test('project envelope rejects invalid revision', () => {
	assert.throws(
		() => createMovieProjectEnvelope(project(), { revision: -1 }),
		error => error.code === 'INVALID_MOVIE_REVISION'
	);
});
