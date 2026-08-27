// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieMultiClipMove.test.mjs
 * @description Proves bounded atomic selected-group movement, collision rejection, and immutability.
 * The Awtsmoos moves the chosen stars while their constellation stays whole;
 * Awtsmoos.com guards project bounds and every unselected role.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { moveSelectedMovieClips } from '../../movie/MovieMultiClipMove.js';

function project() {
	return {
		duration: 20,
		tracks: [
			{
				id: 'video',
				clips: [
					{ duration: 2, id: 'a', start: 1 },
					{ duration: 2, id: 'b', start: 5 },
					{ duration: 2, id: 'wall', start: 12 }
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
		{ clipId: 'b', trackId: 'video' },
		{ clipId: 'c', trackId: 'audio' }
	],
	primary: { clipId: 'b', trackId: 'video' },
	range: { end: 7, start: 1 }
};

test('moves selected clips together and preserves immutable selection metadata', () => {
	const source = project();
	const result = moveSelectedMovieClips(source, selection, 2);
	assert.deepEqual(source.tracks[0].clips.map(clip => clip.start), [1, 5, 12]);
	assert.deepEqual(result.project.tracks[0].clips.map(clip => clip.start), [3, 7, 12]);
	assert.deepEqual(result.project.tracks[1].clips.map(clip => clip.start), [5]);
	assert.deepEqual(result.selection, selection);
	assert.notEqual(result.selection, selection);
	assert.deepEqual(result.detail, { effectiveDelta: 2, requestedDelta: 2 });
});

test('clamps the complete group at project start and end', () => {
	const backward = moveSelectedMovieClips(project(), selection, -100);
	assert.equal(backward.detail.effectiveDelta, -1);
	assert.deepEqual(backward.project.tracks[0].clips.slice(0, 2).map(clip => clip.start), [0, 4]);
	const forwardProject = project();
	forwardProject.tracks[0].clips = forwardProject.tracks[0].clips.slice(0, 2);
	const forward = moveSelectedMovieClips(forwardProject, selection, 100);
	assert.equal(forward.detail.effectiveDelta, 13);
});

test('permits edge adjacency and rejects actual overlap on the same track', () => {
	const adjacent = moveSelectedMovieClips(project(), selection, 5);
	assert.equal(adjacent.project.tracks[0].clips[1].start, 10);
	assert.throws(
		() => moveSelectedMovieClips(project(), selection, 6),
		/overlap clip wall/
	);
});

test('rejects missing selection and non-finite delta', () => {
	assert.throws(() => moveSelectedMovieClips(project(), null, 1), /Select/);
	assert.throws(() => moveSelectedMovieClips(project(), selection, Infinity), /finite/);
});
