// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiFacade.test.mjs
 * @description Proves stable API identity, immutable project access, versions, and revision guards.
 * The Awtsmoos renews each project while public identity remains beyond replacement;
 * Awtsmoos.com verifies agents can serialize everything they need without mutating live state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMovieStudioApiHarness,
	sampleMovieProject
} from './movieStudioApiHarness.mjs';

test('stable facade exposes versions, capabilities, and serializable root state', () => {
	const { api } = createMovieStudioApiHarness();
	assert.equal(api.apiVersion, '2.0.0');
	assert.equal(api.projectSchemaVersion, 2);
	assert.equal(api.agentManifestVersion, 1);
	assert.equal(api.capabilities.agentCompilation, true);
	const serialized = JSON.parse(JSON.stringify(api));
	assert.equal(serialized.apiVersion, '2.0.0');
	assert.equal(serialized.project.title, 'API Harness Movie');
	assert.equal(serialized.revision, 1);
});

test('project compatibility fields are immutable detached snapshots', () => {
	const { api, session } = createMovieStudioApiHarness();
	assert.equal(api.project.tracks[0].clips[0].id, 'clip');
	assert.equal(Object.isFrozen(api.project.tracks), true);
	assert.throws(() => {
		api.project.tracks[0].clips[0].duration = 99;
	}, TypeError);
	assert.equal(session.project.tracks[0].clips[0].duration, 4);
	const json = JSON.parse(JSON.stringify(api.project));
	assert.equal(json.title, 'API Harness Movie');
});

test('same API identity observes current project after replacement', () => {
	const { api, session } = createMovieStudioApiHarness();
	const held = api;
	const replacement = sampleMovieProject();
	replacement.title = 'Replacement';
	const result = api.project.replace(replacement, {
		expectedRevision: 1,
		requestId: 'replace-1'
	});
	assert.equal(result.ok, true);
	assert.equal(result.metadata.beforeRevision, 1);
	assert.equal(result.metadata.afterRevision, 2);
	assert.equal(result.metadata.requestId, 'replace-1');
	assert.equal(api, held);
	assert.equal(api.project.title, 'Replacement');
	assert.equal(api.revision, 2);
	assert.equal(session.commands.history.canUndo, true);
});

test('stale revision returns coded serializable failure without mutation', () => {
	const { api } = createMovieStudioApiHarness();
	const replacement = sampleMovieProject();
	replacement.title = 'Stale attempt';
	const result = api.project.replace(replacement, {
		expectedRevision: 0,
		requestId: 'stale-1'
	});
	assert.equal(result.ok, false);
	assert.equal(result.error.code, 'STALE_MOVIE_REVISION');
	assert.equal(api.project.title, 'API Harness Movie');
	assert.doesNotThrow(() => JSON.stringify(result));
});

test('project envelope serializes, imports, and remains undoable', () => {
	const { api } = createMovieStudioApiHarness();
	const serialized = api.project.serialize({
		exportedAt: '2026-07-28T00:00:00.000Z',
		metadata: { source: 'facade-test' }
	});
	const envelope = JSON.parse(serialized);
	assert.equal(envelope.revision, 1);
	envelope.project.title = 'Tampered';
	assert.equal(api.project.import(envelope).ok, false);
	const valid = api.project.import(serialized, { expectedRevision: 1 });
	assert.equal(valid.ok, true);
	assert.equal(api.history.state().canUndo, true);
});
