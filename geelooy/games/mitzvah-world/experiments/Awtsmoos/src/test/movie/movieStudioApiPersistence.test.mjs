// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiPersistence.test.mjs
 * @description Proves save/load/list/remove, adapter discovery, undoable restoration, and autosave lifecycle.
 * The Awtsmoos renews remembered project and arrangement in one present; Awtsmoos.com
 * verifies agents can persist safely while project revision, UI neutrality, events, and undo agree.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieMemoryPersistenceAdapter } from '../../movie/MovieMemoryPersistenceAdapter.js';
import { createMovieStudioApiHarness, sampleMovieProject } from './movieStudioApiHarness.mjs';

test('save, mutate, load, and undo restore project and UI through one load revision', async () => {
	const { api, session } = createMovieStudioApiHarness();
	api.ui.setPreferences({ density: 'compact', theme: 'light' });
	const saved = await api.persistence.save('journey', {
		expectedRevision: 1,
		metadata: { owner: 'agent' },
		requestId: 'save-1',
		savedAt: '2026-07-28T00:00:00.000Z'
	});
	assert.equal(saved.ok, true);
	assert.equal(saved.metadata.afterRevision, 1);
	const replacement = sampleMovieProject();
	replacement.title = 'Mutated Movie';
	api.project.replace(replacement, { expectedRevision: 1 });
	api.ui.setPreferences({ density: 'touch', theme: 'neutral-dark' });
	const beforeLoadRevision = api.revision;
	const loaded = await api.persistence.load('journey', {
		expectedRevision: beforeLoadRevision,
		requestId: 'load-1'
	});
	assert.equal(loaded.ok, true);
	assert.equal(loaded.metadata.beforeRevision, beforeLoadRevision);
	assert.equal(loaded.metadata.afterRevision, beforeLoadRevision + 1);
	assert.equal(api.project.title, 'API Harness Movie');
	assert.equal(api.ui.getPreferences().density, 'compact');
	assert.equal(api.ui.getPreferences().theme, 'light');
	assert.equal(session.commands.history.canUndo, true);
	api.history.undo();
	assert.equal(api.project.title, 'Mutated Movie');
});

test('list, remove, adapter selection, and trusted registration are serializable', async () => {
	const { api } = createMovieStudioApiHarness();
	api.persistence.registerTrusted({
		description: 'Second memory adapter.',
		id: 'secondary',
		persistent: false,
		version: 1
	}, new MovieMemoryPersistenceAdapter('secondary'));
	const selected = api.persistence.select('secondary');
	assert.equal(selected.ok, true);
	assert.equal(selected.value.activeId, 'secondary');
	await api.persistence.save('b');
	await api.persistence.save('a');
	const listed = await api.persistence.list();
	assert.equal(listed.ok, true);
	assert.deepEqual(listed.value.records.map(item => item.key), ['a', 'b']);
	const removed = await api.persistence.remove('a');
	assert.equal(removed.ok, true);
	assert.equal(removed.value.removed, true);
	assert.equal((await api.persistence.list()).value.records.length, 1);
	assert.doesNotThrow(() => JSON.stringify(api.persistence.adapters()));
	assert.equal(api.persistence.unregisterTrusted('secondary'), true);
});

test('autosave schedules on project changes, flushes verified record, and stops cleanly', async () => {
	const { api, session } = createMovieStudioApiHarness();
	const events = [];
	api.events.on('autosave:saved', event => events.push(event));
	const started = api.persistence.autosave.start({
		adapterId: 'memory',
		debounceMs: 5,
		key: 'auto'
	});
	assert.equal(started.ok, true);
	const replacement = sampleMovieProject();
	replacement.title = 'Autosaved Movie';
	api.project.replace(replacement, { expectedRevision: 1 });
	assert.equal(api.persistence.autosave.state().pending, true);
	await new Promise(resolve => setTimeout(resolve, 30));
	const records = (await api.persistence.list()).value.records;
	assert.equal(records[0].key, 'auto');
	assert.equal(records[0].title, 'Autosaved Movie');
	assert.equal(events.length, 1);
	assert.equal(api.persistence.autosave.state().lastSavedRevision, 2);
	const stopped = api.persistence.autosave.stop();
	assert.equal(stopped.ok, true);
	assert.equal(stopped.value.active, false);
	assert.equal(stopped.value.pending, false);
	assert.equal(session.autosave.unsubscribe.length, 0);
});

test('autosave flush before start and stale persistence calls return structured failures', async () => {
	const { api } = createMovieStudioApiHarness();
	const flush = await api.persistence.autosave.flush();
	assert.equal(flush.ok, false);
	assert.equal(flush.error.code, 'MOVIE_AUTOSAVE_NOT_ACTIVE');
	const stale = await api.persistence.save('stale', { expectedRevision: 99 });
	assert.equal(stale.ok, false);
	assert.equal(stale.error.code, 'STALE_MOVIE_REVISION');
	assert.equal((await api.persistence.list()).value.records.length, 0);
});
