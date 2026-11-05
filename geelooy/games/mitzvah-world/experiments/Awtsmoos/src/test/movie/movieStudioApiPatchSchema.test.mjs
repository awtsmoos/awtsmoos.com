// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiPatchSchema.test.mjs
 * @description Proves revisioned patch transactions and pure schema dry-run/apply through stable API.
 * The Awtsmoos renews project difference and schema within one source; Awtsmoos.com
 * verifies agents can preview precisely, install once, undo, and evolve without stale mutation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createDefaultMovieProjectMigrationRegistry } from '../../movie/MovieProjectMigrations.js';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

test('patch diff, preview, apply, invert, and undo preserve one transaction', () => {
	const { api, session } = createMovieStudioApiHarness();
	const before = api.project.snapshot();
	const after = structuredClone(before);
	after.title = 'Patched Movie';
	after.markers.push({ id: 'patch-marker', label: 'Patch', time: 3 });
	const patch = api.patch.diff(before, after);
	const preview = api.patch.preview(patch);
	assert.equal(preview.project.title, 'Patched Movie');
	assert.equal(preview.project.markers.length, 1);
	assert.equal(api.revision, 1);
	const result = api.patch.apply(patch, {
		expectedRevision: 1,
		label: 'Patch title and marker',
		requestId: 'patch-1'
	});
	assert.equal(result.ok, true);
	assert.equal(result.metadata.afterRevision, 2);
	assert.equal(api.project.title, 'Patched Movie');
	assert.equal(session.commands.history.past.length, 1);
	api.history.undo();
	assert.equal(api.project.title, 'API Harness Movie');
	assert.deepEqual(api.project.markers, []);
	const inverse = api.patch.invert(patch, before);
	assert.deepEqual(api.patch.preview(patch).inverse, inverse);
});

test('invalid and stale patches return coded failures without mutation', () => {
	const { api } = createMovieStudioApiHarness();
	const before = JSON.stringify(api.project);
	const invalid = api.patch.apply([
		{ op: 'replace', path: '/missing', value: 1 }
	]);
	assert.equal(invalid.ok, false);
	assert.equal(invalid.error.code, 'MOVIE_PATCH_PATH_NOT_FOUND');
	const stale = api.patch.apply([
		{ op: 'replace', path: '/title', value: 'Nope' }
	], { expectedRevision: 99 });
	assert.equal(stale.ok, false);
	assert.equal(stale.error.code, 'STALE_MOVIE_REVISION');
	assert.equal(JSON.stringify(api.project), before);
	assert.equal(api.revision, 1);
});

test('schema dry-run is pure and apply creates one undoable revision', () => {
	const { api, session } = createMovieStudioApiHarness();
	session.migrations = createDefaultMovieProjectMigrationRegistry();
	const legacy = structuredClone(api.project.snapshot());
	delete legacy.projectSchemaVersion;
	delete legacy.metadata;
	delete legacy.markers;
	const dryRun = api.schema.dryRun(legacy, { fromVersion: 1 });
	assert.equal(dryRun.toVersion, 2);
	assert.equal(dryRun.project.projectSchemaVersion, 2);
	assert.equal(api.revision, 1);
	const applied = api.schema.apply(legacy, {
		expectedRevision: 1,
		fromVersion: 1,
		requestId: 'migration-1'
	});
	assert.equal(applied.ok, true);
	assert.equal(applied.metadata.afterRevision, 2);
	assert.equal(api.project.projectSchemaVersion, 2);
	assert.equal(api.history.state().canUndo, true);
	api.history.undo();
	assert.equal(api.revision, 3);
});

test('trusted custom migration remains local and serializable only by manifest', () => {
	const { api, session } = createMovieStudioApiHarness();
	session.migrations = createDefaultMovieProjectMigrationRegistry();
	const manifest = api.schema.registerTrusted({
		description: 'Add local field.',
		from: 2,
		id: 'local-two-three',
		to: 3
	}, project => ({ ...project, localField: true }));
	assert.equal(manifest.id, 'local-two-three');
	assert.doesNotThrow(() => JSON.stringify(api.schema.list()));
	assert.equal(JSON.stringify(api).includes('localField'), false);
});
