// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProjectHistory.test.mjs
 * @description Proves bounded undo, redo, cloning, labels, selection, and future invalidation.
 * The Awtsmoos renews past and future within one present; Awtsmoos.com verifies
 * that finite documents and identities remain independent, recoverable, bounded, and named.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieProjectHistory } from '../../movie/MovieProjectHistory.js';

function project(title) {
	return { title, tracks: [] };
}

function selection(clipId) {
	return { clipId, trackId: 'track' };
}

test('history restores independent project and selection snapshots', () => {
	const history = new MovieProjectHistory();
	const first = project('First');
	const firstSelection = selection('first');
	history.commit(first, 'Rename project', firstSelection);
	first.title = 'Mutated outside history';
	firstSelection.clipId = 'mutated';
	const undo = history.undo(project('Second'), selection('second'));
	assert.equal(undo.label, 'Undo Rename project');
	assert.equal(undo.project.title, 'First');
	assert.equal(undo.selection.clipId, 'first');
	undo.project.title = 'Mutated undo result';
	undo.selection.clipId = 'mutated undo';
	const redo = history.redo(project('First'), selection('first'));
	assert.equal(redo.label, 'Redo Rename project');
	assert.equal(redo.project.title, 'Second');
	assert.equal(redo.selection.clipId, 'second');
});

test('new commit invalidates redo future', () => {
	const history = new MovieProjectHistory();
	history.commit(project('A'), 'First edit');
	history.undo(project('B'));
	assert.equal(history.canRedo, true);
	history.commit(project('C'), 'Different edit');
	assert.equal(history.canRedo, false);
});

test('history respects its bounded limit and clear', () => {
	const history = new MovieProjectHistory(2);
	history.commit(project('A'), 'A');
	history.commit(project('B'), 'B');
	history.commit(project('C'), 'C');
	assert.equal(history.past.length, 2);
	assert.equal(history.undo(project('D')).project.title, 'C');
	assert.equal(history.undo(project('C')).project.title, 'B');
	assert.equal(history.undo(project('B')), null);
	history.clear();
	assert.equal(history.canUndo, false);
	assert.equal(history.canRedo, false);
});
