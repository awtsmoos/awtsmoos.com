// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieMultiClipCommands.test.mjs
 * @description Proves atomic selected-many deletion, duplication, timing, identity, bounds, and immutability.
 * The Awtsmoos holds every selected spark within one command flame;
 * Awtsmoos.com verifies the copied many keep their distances and receive a new name.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	deleteSelectedMovieClips,
	duplicateSelectedMovieClips
} from '../../movie/MovieMultiClipCommands.js';

function project() {
	return {
		duration: 20,
		tracks: [
			{
				id: 'video',
				clips: [
					{ duration: 2, id: 'a', start: 1 },
					{ duration: 3, id: 'b', start: 5 },
					{ duration: 1, id: 'stay', start: 15 }
				]
			},
			{
				id: 'audio',
				clips: [{ duration: 2, id: 'c', start: 3 }]
			}
		]
	};
}

const selection = {
	items: [
		{ clipId: 'a', trackId: 'video' },
		{ clipId: 'c', trackId: 'audio' },
		{ clipId: 'b', trackId: 'video' }
	],
	primary: { clipId: 'b', trackId: 'video' },
	range: { start: 1, end: 8 }
};

test('multi-delete removes selected clips across tracks without mutating source', () => {
	const source = project();
	const result = deleteSelectedMovieClips(source, selection);
	assert.deepEqual(source.tracks.map(track => track.clips.length), [3, 1]);
	assert.deepEqual(result.project.tracks[0].clips.map(clip => clip.id), ['stay']);
	assert.deepEqual(result.project.tracks[1].clips, []);
	assert.equal(result.selection, null);
	assert.equal(result.label, 'Delete selected clips');
});

test('multi-duplicate preserves relative timing and selects all copies', () => {
	const source = project();
	const result = duplicateSelectedMovieClips(source, selection);
	assert.deepEqual(source.tracks.map(track => track.clips.length), [3, 1]);
	assert.deepEqual(result.selection.items.map(item => item.clipId), [
		'a-copy',
		'c-copy',
		'b-copy'
	]);
	assert.deepEqual(result.selection.primary, {
		clipId: 'b-copy',
		trackId: 'video'
	});
	const starts = result.selection.items.map(item => {
		const track = result.project.tracks.find(entry => entry.id === item.trackId);
		return track.clips.find(clip => clip.id === item.clipId).start;
	});
	assert.deepEqual(starts, [8, 10, 12]);
	assert.deepEqual(result.selection.range, { start: 1, end: 8 });
});

test('single-item duplicate delegates to legacy operation', () => {
	assert.equal(duplicateSelectedMovieClips(project(), {
		items: [{ clipId: 'a', trackId: 'video' }]
	}), null);
});

test('multi-duplicate rejects clusters that cannot fit before or after', () => {
	const source = project();
	source.duration = 8;
	assert.throws(
		() => duplicateSelectedMovieClips(source, selection),
		/cannot be duplicated/
	);
});
