// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiCommands.test.mjs
 * @description Proves structured commands, request metadata, coded failures, and atomic batches.
 * The Awtsmoos renews one act and many acts through the same source; Awtsmoos.com verifies
 * that machines receive serializable results while one bounded batch becomes one revision and undo.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMovieStudioApiHarness,
	selectHarnessClip
} from './movieStudioApiHarness.mjs';

test('structured command aliases return revisioned immutable summaries', () => {
	const { api, session } = createMovieStudioApiHarness();
	selectHarnessClip(session);
	session.time = 4;
	const result = api.commands.execute({
		options: { expectedRevision: 1, requestId: 'split-1' },
		payload: {},
		type: 'clip.split'
	});
	assert.equal(result.ok, true);
	assert.equal(result.metadata.requestId, 'split-1');
	assert.equal(result.metadata.afterRevision, 2);
	assert.equal(result.value.command, 'split');
	assert.equal(result.value.project.tracks[0].clips.length, 2);
	assert.equal(Object.isFrozen(result.value), true);
});

test('unknown and stale commands return coded failures', () => {
	const { api } = createMovieStudioApiHarness();
	const unknown = api.commands.execute('clip.explode');
	assert.equal(unknown.ok, false);
	assert.equal(unknown.error.code, 'UNKNOWN_MOVIE_COMMAND');
	const stale = api.commands.execute({
		options: { expectedRevision: 99 },
		type: 'marker.add'
	});
	assert.equal(stale.ok, false);
	assert.equal(stale.error.code, 'STALE_MOVIE_REVISION');
	assert.equal(api.revision, 1);
});

test('batch applies multiple project commands in one revision and history entry', () => {
	const { api, session } = createMovieStudioApiHarness();
	const result = api.commands.executeBatch([
		{ payload: { time: 2 }, type: 'marker.add' },
		{ payload: { time: 6 }, type: 'marker.add' }
	], {
		expectedRevision: 1,
		label: 'Add two markers',
		requestId: 'batch-1'
	});
	assert.equal(result.ok, true);
	assert.equal(result.metadata.beforeRevision, 1);
	assert.equal(result.metadata.afterRevision, 2);
	assert.equal(api.project.markers.length, 2);
	assert.equal(session.commands.history.past.length, 1);
	assert.equal(result.value.count, 2);
	api.history.undo();
	assert.equal(api.project.markers.length, 0);
});

test('invalid batch is atomic and cannot include history commands', () => {
	const { api } = createMovieStudioApiHarness();
	const before = JSON.stringify(api.project);
	const result = api.transactions.execute([
		{ payload: { time: 2 }, type: 'marker.add' },
		{ type: 'history.undo' }
	]);
	assert.equal(result.ok, false);
	assert.equal(result.error.code, 'MOVIE_COMMAND_NOT_BATCHABLE');
	assert.equal(JSON.stringify(api.project), before);
	assert.equal(api.revision, 1);
});

test('selection and timeline domains are revision-aware and serializable', () => {
	const { api } = createMovieStudioApiHarness();
	const selected = api.selection.set({ clipId: 'clip', trackId: 'actors' });
	assert.equal(selected.ok, true);
	assert.equal(api.commands.canExecute('clip.split'), true);
	const seek = api.timeline.seek(5.5);
	assert.equal(seek.ok, true);
	assert.equal(seek.value.time, 5.5);
	const scale = api.timeline.setScale(80);
	assert.equal(scale.value.scale, 80);
	const snap = api.timeline.setSnapping(false);
	assert.equal(snap.ok, true);
	assert.equal(api.timeline.state().snapping, false);
});
