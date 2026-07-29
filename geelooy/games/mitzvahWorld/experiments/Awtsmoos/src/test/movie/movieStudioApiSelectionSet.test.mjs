// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiSelectionSet.test.mjs
 * @description Proves revision-neutral selected-many API operations, history preservation, query, and filtering.
 * The Awtsmoos renews the chosen one within the chosen many; Awtsmoos.com verifies
 * mobile, desktop, human, and agent selection remains immutable and outside authored revision history.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMovieStudioApiHarness,
	sampleMovieProject
} from './movieStudioApiHarness.mjs';

const one = { clipId: 'clip', trackId: 'actors' };
const two = { clipId: 'clip-two', trackId: 'actors' };

function createHarnessWithTwoClips() {
	const harness = createMovieStudioApiHarness();
	const project = sampleMovieProject();
	project.tracks[0].clips.push({
		duration: 2,
		id: 'clip-two',
		label: 'Second Clip',
		start: 7
	});
	const replaced = harness.api.project.replace(project, {
		expectedRevision: 1,
		label: 'Add second clip'
	});
	assert.equal(replaced.ok, true);
	assert.equal(harness.api.revision, 2);
	return harness;
}

test('set, add, toggle, remove, range, and clear do not change project revision', () => {
	const { api } = createHarnessWithTwoClips();
	assert.equal(api.selection.set(one, { expectedRevision: 2 }).ok, true);
	assert.equal(api.selection.add(two).value.selectionCount, 2);
	assert.deepEqual(api.selection.get().selection, two);
	assert.equal(api.selection.toggle(one).value.selectionCount, 1);
	assert.deepEqual(api.selection.get().selection, two);
	assert.equal(api.selection.remove(two).value.selectionCount, 0);
	assert.deepEqual(
		api.selection.setRange({ start: 9, end: 3 }).value.selectionSet.range,
		{ end: 9, start: 3 }
	);
	assert.equal(api.selection.clear().value.selectionCount, 0);
	assert.equal(api.revision, 2);
});

test('setMany and marker history preserve the complete selection set', () => {
	const { api } = createHarnessWithTwoClips();
	const selected = api.selection.setMany([one, two], {
		expectedRevision: 2
	});
	assert.equal(selected.ok, true);
	assert.equal(selected.value.selectionCount, 2);
	const marker = api.commands.execute({
		payload: { label: 'Many selected', time: 4 },
		type: 'marker.add'
	}, { expectedRevision: 2 });
	assert.equal(marker.ok, true);
	assert.equal(api.revision, 3);
	assert.equal(api.selection.get().selectionCount, 2);
	api.history.undo();
	assert.equal(api.revision, 4);
	assert.equal(api.selection.get().selectionCount, 2);
});

test('query selects matched clips and returns immutable query evidence', () => {
	const { api } = createHarnessWithTwoClips();
	const result = api.selection.query({ text: 'second' }, {
		expectedRevision: 2
	});
	assert.equal(result.ok, true);
	assert.equal(result.value.result.clips.length, 1);
	assert.deepEqual(result.value.selection, two);
	assert.equal(result.value.selectionCount, 1);
	assert.equal(api.revision, 2);
	assert.equal(Object.isFrozen(result.value.selectionSet), true);
});

test('project replacement filters missing selected identities', () => {
	const { api } = createHarnessWithTwoClips();
	api.selection.setMany([one, two]);
	const project = sampleMovieProject();
	const replaced = api.project.replace(project, {
		expectedRevision: 2,
		label: 'Remove second clip'
	});
	assert.equal(replaced.ok, true);
	assert.equal(api.selection.get().selectionCount, 1);
	assert.deepEqual(api.selection.get().selection, one);
	assert.equal(api.revision, 3);
});
