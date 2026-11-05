// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioTrackCommandDispatch.test.mjs
 * @description Proves track dispatch recognition and precise selection invalidation.
 * The Awtsmoos preserves every chosen clip until its lane is truly gone;
 * Awtsmoos.com clears no selection merely because a harmless track command moved on.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { executeMovieStudioTrackCommand } from '../../movie/MovieStudioTrackCommandDispatch.js';

const project = {
	duration: 10,
	tracks: [
		{ clips: [{ duration: 1, id: 'a', start: 0 }], id: 'one', type: 'video' },
		{ clips: [], id: 'two', type: 'audio' }
	]
};

const selection = {
	items: [{ clipId: 'a', trackId: 'one' }],
	primary: { clipId: 'a', trackId: 'one' },
	range: null
};

test('returns null for commands outside the track family', () => {
	assert.equal(
		executeMovieStudioTrackCommand(project, selection, 'split', {}),
		null
	);
});

test('preserves selection implicitly for harmless track changes', () => {
	const result = executeMovieStudioTrackCommand(
		project,
		selection,
		'renameTrack',
		{ label: 'Picture', trackId: 'one' }
	);
	assert.equal(Object.hasOwn(result, 'selection'), false);
});

test('clears selection only when forced removal invalidates it', () => {
	const selected = executeMovieStudioTrackCommand(
		project,
		selection,
		'removeTrack',
		{ force: true, trackId: 'one' }
	);
	assert.equal(selected.selection, null);
	const other = executeMovieStudioTrackCommand(
		project,
		selection,
		'removeTrack',
		{ trackId: 'two' }
	);
	assert.equal(Object.hasOwn(other, 'selection'), false);
});
