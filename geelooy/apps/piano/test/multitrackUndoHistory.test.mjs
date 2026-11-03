//B"H
//Boruch Hashem
//Blessed is He
/** @module MultitrackUndoHistoryTests
 * The Awtsmoos gives music a history and the player freedom to return.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { MultitrackStudioDaas } from '../modules/workstation/song/multitrack/multitrackState.js';
import { MultitrackEditHistory } from '../modules/workstation/song/multitrack/multitrackEditHistory.js';

/** @param {number} start - Sound position. @returns {Object} Fresh project. */
function project(start) {
	return {
		id: 'history-song', tempo: 120,
		tracks: [{ id: 'voice', clips: [{
			id: 'one', bufferId: 'wave', timelineStart: start,
			sourceOffset: 0, duration: 2
		}] }]
	};
}

test('Undo restores deleted or moved clips and Redo reapplies them', () => {
	const state = new MultitrackStudioDaas();
	state.setProject(project(0));
	state.selectClip('voice', 'one');
	state.setProject(project(3));
	assert.ok(state.history.canUndo);
	assert.equal(state.project.tracks[0].clips[0].timelineStart, 3);
	assert.equal(state.travelHistory('undo'), true);
	assert.equal(state.project.tracks[0].clips[0].timelineStart, 0);
	assert.equal(state.selection.clipId, 'one');
	assert.equal(state.travelHistory('redo'), true);
	assert.equal(state.project.tracks[0].clips[0].timelineStart, 3);
});

test('Editing after Undo clears Redo, but seeking does not create history', () => {
	const state = new MultitrackStudioDaas();
	state.setProject(project(1));
	state.setProject(project(2));
	assert.equal(state.travelHistory('undo'), true);
	assert.equal(state.history.canRedo, true);
	const before = state.history.past.length;
	state.setPlayhead(1.25);
	assert.equal(state.history.past.length, before);
	state.setProject(project(4));
	assert.equal(state.history.canRedo, false);
});

test('One complete pointer drag is recorded as one edit', () => {
	const state = new MultitrackStudioDaas();
	state.setProject(project(0));
	const before = state.snapshot();
	const steps = state.history.past.length;
	state.project = project(1);
	state.project = project(2);
	state.project = project(3);
	state.commitGesture(before);
	assert.equal(state.history.past.length, steps + 1);
	state.travelHistory('undo');
	assert.equal(state.project.tracks[0].clips[0].timelineStart, 0);
});

test('Undo history is bounded to fifty edits', () => {
	const history = new MultitrackEditHistory();
	for (let index = 0; index < 75; index++) {
		history.record({ project: project(index) }, project(index + 1));
	}
	assert.equal(history.past.length, 50);
	assert.equal(history.canRedo, false);
});
