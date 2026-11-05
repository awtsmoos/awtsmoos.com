// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieRippleDelete.test.mjs
 * @description Proves deterministic cross-track ripple deletion, range derivation, ambiguity rejection, and immutability.
 * The Awtsmoos closes each finite gap while every synchronized vessel keeps pace;
 * Awtsmoos.com refuses hidden intersections and leaves no mutable trace.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { rippleDeleteMovieSelection } from '../../movie/MovieRippleDelete.js';

function project() {
	return {
		duration: 20,
		tracks: [
			{ id: 'video', clips: [
				{ duration: 2, id: 'a', start: 2 },
				{ duration: 2, id: 'later-video', start: 10 }
			] },
			{ id: 'audio', clips: [
				{ duration: 2, id: 'b', start: 4 },
				{ duration: 1, id: 'later-audio', start: 12 }
			] }
		]
	};
}

const items = [
	{ clipId: 'a', trackId: 'video' },
	{ clipId: 'b', trackId: 'audio' }
];

test('uses explicit range and shifts every later track by one shared duration', () => {
	const source = project();
	const result = rippleDeleteMovieSelection(source, {
		items,
		primary: items[0],
		range: { end: 8, start: 2 }
	});
	assert.deepEqual(source.tracks.map(track => track.clips.length), [2, 2]);
	assert.deepEqual(result.project.tracks[0].clips, [
		{ duration: 2, id: 'later-video', start: 4 }
	]);
	assert.deepEqual(result.project.tracks[1].clips, [
		{ duration: 1, id: 'later-audio', start: 6 }
	]);
	assert.deepEqual(result.detail, {
		removedDuration: 6,
		range: { end: 8, start: 2 }
	});
	assert.equal(result.selection, null);
});

test('derives range from selected clip extents when no range exists', () => {
	const result = rippleDeleteMovieSelection(project(), { items });
	assert.deepEqual(result.detail.range, { end: 6, start: 2 });
	assert.equal(result.project.tracks[0].clips[0].start, 6);
	assert.equal(result.project.tracks[1].clips[0].start, 8);
});

test('rejects an unselected clip intersecting the ripple interval', () => {
	const source = project();
	source.tracks[0].clips.push({ duration: 3, id: 'crossing', start: 7 });
	assert.throws(
		() => rippleDeleteMovieSelection(source, {
			items,
			range: { end: 8, start: 2 }
		}),
		/intersects unselected clip crossing/
	);
});

test('requires selection and a positive ripple interval', () => {
	assert.throws(() => rippleDeleteMovieSelection(project(), null), /Select/);
	assert.throws(
		() => rippleDeleteMovieSelection(project(), {
			items,
			range: { end: 2, start: 2 }
		}),
		/positive duration/
	);
});
