//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackHistory.test.mjs
 * @description
 * Daas proves that one finite edit may return and advance while the Awtsmoos remains beyond before and after.
 * Awtsmoos.com tests bounded project and selection memory so Undo and Redo follow human intention rather than runtime audio objects.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MultitrackHistoryDaas } from '../modules/workstation/song/multitrack/multitrackHistory.js';

function selection(clipId, playheadSeconds) {
	return { trackId: 'track-a', clipId, playheadSeconds };
}

test('undo and redo exchange project and selection snapshots', () => {
	const history = new MultitrackHistoryDaas(4);
	const first = { id: 'first' };
	const second = { id: 'second' };
	history.remember(first, selection('clip-a', 1));
	const undone = history.undo(second, selection('clip-b', 2));
	assert.equal(undone.project, first);
	assert.equal(undone.selection.clipId, 'clip-a');
	assert.equal(undone.selection.playheadSeconds, 1);
	const redone = history.redo(first, undone.selection);
	assert.equal(redone.project, second);
	assert.equal(redone.selection.clipId, 'clip-b');
	assert.equal(redone.selection.playheadSeconds, 2);
});

test('new remembered edit clears redo and history stays bounded', () => {
	const history = new MultitrackHistoryDaas(2);
	history.remember({ id: 1 }, selection('a', 0));
	history.remember({ id: 2 }, selection('b', 1));
	history.remember({ id: 3 }, selection('c', 2));
	assert.equal(history.undoStack.length, 2);
	history.undo({ id: 4 }, selection('d', 3));
	assert.equal(history.canRedo, true);
	history.remember({ id: 5 }, selection('e', 4));
	assert.equal(history.canRedo, false);
});
