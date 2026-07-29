// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieMultiClipArrange.test.mjs
 * @description Proves atomic alignment, distribution, bounds, collision safety, and immutability.
 * The Awtsmoos aligns every chosen vessel while identity stays bright;
 * Awtsmoos.com measures equal space and guards each neighboring site.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	alignSelectedMovieClips,
	distributeSelectedMovieClips
} from '../../movie/MovieMultiClipArrange.js';

function project() {
	return {
		duration: 20,
		tracks: [
			{ id: 'one', clips: [{ duration: 2, id: 'a', start: 1 }] },
			{ id: 'two', clips: [{ duration: 3, id: 'b', start: 5 }] },
			{ id: 'three', clips: [
				{ duration: 1, id: 'c', start: 11 },
				{ duration: 2, id: 'wall', start: 15 }
			] }
		]
	};
}

const selection = {
	items: [
		{ clipId: 'a', trackId: 'one' },
		{ clipId: 'b', trackId: 'two' },
		{ clipId: 'c', trackId: 'three' }
	],
	primary: { clipId: 'b', trackId: 'two' },
	range: { end: 12, start: 1 }
};

test('aligns selected starts to the primary clip without mutating source', () => {
	const source = project();
	const result = alignSelectedMovieClips(source, selection, 'start');
	assert.deepEqual(source.tracks.map(track => track.clips[0].start), [1, 5, 11]);
	assert.deepEqual(result.project.tracks.map(track => track.clips[0].start), [5, 5, 5]);
	assert.deepEqual(result.selection, selection);
	assert.notEqual(result.selection, selection);
});

test('aligns selected ends while preserving every duration', () => {
	const result = alignSelectedMovieClips(project(), selection, 'end');
	assert.deepEqual(result.project.tracks.map(track => track.clips[0].start), [6, 5, 7]);
	assert.deepEqual(result.project.tracks.map(track => track.clips[0].duration), [2, 3, 1]);
});

test('distributes selected clips evenly across their existing outer span', () => {
	const result = distributeSelectedMovieClips(project(), selection);
	assert.deepEqual(result.project.tracks.map(track => track.clips[0].start), [1, 5.5, 11]);
	assert.equal(result.label, 'Distribute selected clips');
});

test('rejects insufficient selection, bounds, and unselected collisions', () => {
	assert.throws(
		() => distributeSelectedMovieClips(project(), { items: [selection.items[0]] }),
		/at least two/
	);
	const bounded = project();
	bounded.tracks[0].clips[0].duration = 10;
	bounded.tracks[1].clips[0].start = 1;
	bounded.tracks[1].clips[0].duration = 2;
	assert.throws(
		() => alignSelectedMovieClips(bounded, selection, 'end'),
		/bounds/
	);
	const collision = project();
	collision.tracks[2].clips[1].start = 7;
	assert.throws(
		() => alignSelectedMovieClips(collision, selection, 'end'),
		/overlaps clip wall/
	);
});
