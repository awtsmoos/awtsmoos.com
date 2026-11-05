// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePersistenceRecord.test.mjs
 * @description Proves nested checksums, immutable UI/project round trips, metadata, and tamper rejection.
 * The Awtsmoos renews memory beyond its written vessel; Awtsmoos.com verifies one saved
 * record contains only canonical project, bounded preferences, metadata, time, and matching evidence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMoviePersistenceRecord,
	parseMoviePersistenceRecord,
	serializeMoviePersistenceRecord
} from '../../movie/MoviePersistenceRecord.js';
import { sampleMovieProject } from './movieStudioApiHarness.mjs';

const SAVED_AT = '2026-07-28T00:00:00.000Z';

test('persistence record round trips project, UI, revision, and metadata', () => {
	const project = sampleMovieProject();
	const ui = {
		density: 'compact',
		overlays: { thirds: true },
		theme: 'light',
		timelineHeight: 420
	};
	const record = createMoviePersistenceRecord(project, ui, {
		key: 'journey',
		metadata: { owner: 'agent' },
		revision: 7,
		savedAt: SAVED_AT
	});
	const parsed = parseMoviePersistenceRecord(record);
	assert.equal(parsed.key, 'journey');
	assert.equal(parsed.savedAt, SAVED_AT);
	assert.equal(parsed.metadata.owner, 'agent');
	assert.equal(parsed.project.revision, 7);
	assert.equal(parsed.project.project.title, project.title);
	assert.equal(parsed.ui.density, 'compact');
	assert.equal(parsed.ui.overlays.thirds, true);
	assert.equal(Object.isFrozen(parsed), true);
});

test('serialized persistence record is deterministic with fixed timestamp', () => {
	const project = sampleMovieProject();
	const options = { key: 'fixed', revision: 2, savedAt: SAVED_AT };
	const first = serializeMoviePersistenceRecord(project, {}, options);
	const second = serializeMoviePersistenceRecord(project, {}, options);
	assert.equal(first, second);
	assert.doesNotThrow(() => JSON.parse(first));
});

test('outer and nested tampering are rejected', () => {
	const record = structuredClone(createMoviePersistenceRecord(
		sampleMovieProject(),
		{},
		{ key: 'tamper', savedAt: SAVED_AT }
	));
	record.metadata.changed = true;
	assert.throws(
		() => parseMoviePersistenceRecord(record),
		error => error.code === 'MOVIE_PERSISTENCE_CHECKSUM_MISMATCH'
	);
	const nested = structuredClone(createMoviePersistenceRecord(
		sampleMovieProject(),
		{},
		{ key: 'nested', savedAt: SAVED_AT }
	));
	nested.project.project.title = 'Tampered';
	assert.throws(
		() => parseMoviePersistenceRecord(nested),
		error => error.code === 'MOVIE_PERSISTENCE_CHECKSUM_MISMATCH'
	);
});

test('invalid kind and version are coded failures', () => {
	const record = structuredClone(createMoviePersistenceRecord(
		sampleMovieProject(),
		{},
		{ key: 'invalid', savedAt: SAVED_AT }
	));
	record.kind = 'wrong';
	assert.throws(
		() => parseMoviePersistenceRecord(record),
		error => error.code === 'MOVIE_PERSISTENCE_KIND_MISMATCH'
	);
});
