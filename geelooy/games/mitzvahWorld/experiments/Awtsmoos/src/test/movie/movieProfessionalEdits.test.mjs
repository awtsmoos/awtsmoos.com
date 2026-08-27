// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProfessionalEdits.test.mjs
 * @description Proves Roll, Slip, Slide, Rate Stretch, and Ripple Trim remain immutable and geometrically bounded.
 * The Awtsmoos is beyond inner source and outer boundary while each finite trim exchanges measured time;
 * Awtsmoos.com verifies neighboring spans, source windows, rates, following clips, and original project remain fine.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { rateStretchMovieClip } from '../../movie/MovieRateStretch.js';
import { rippleTrimMovieClip } from '../../movie/MovieRippleTrim.js';
import { rollMovieClipEdit } from '../../movie/MovieRollEdit.js';
import { slideMovieClipEdit } from '../../movie/MovieSlideEdit.js';
import { slipMovieClipEdit } from '../../movie/MovieSlipEdit.js';

function project() {
	return {
		duration: 20,
		tracks: [{
			clips: [
				{ duration: 4, id: 'a', sourceDuration: 12, start: 0 },
				{ duration: 4, id: 'b', sourceDuration: 12, start: 4 },
				{ duration: 4, id: 'c', sourceDuration: 12, start: 8 }
			],
			id: 'video',
			type: 'video'
		}]
	};
}

const selection = {
	items: [{ clipId: 'b', trackId: 'video' }],
	primary: { clipId: 'b', trackId: 'video' },
	range: null
};

function clips(result) {
	return result.project.tracks[0].clips;
}

test('roll preserves combined neighboring span', () => {
	const source = project();
	const result = rollMovieClipEdit(source, selection, { delta: 1 });
	assert.deepEqual(clips(result).map(clip => [
		clip.id,
		clip.start,
		clip.duration
	]), [
		['a', 0, 4],
		['b', 4, 5],
		['c', 9, 3]
	]);
	assert.equal(source.tracks[0].clips[1].duration, 4);
});

test('slip preserves geometry and bounds source offset', () => {
	const result = slipMovieClipEdit(project(), selection, { delta: 3 });
	assert.equal(clips(result)[1].start, 4);
	assert.equal(clips(result)[1].duration, 4);
	assert.equal(clips(result)[1].sourceOffset, 3);
	const bounded = slipMovieClipEdit(project(), selection, { delta: 99 });
	assert.equal(bounded.project.tracks[0].clips[1].sourceOffset, 8);
});

test('slide preserves middle duration and outer span', () => {
	const result = slideMovieClipEdit(project(), selection, { delta: 1 });
	assert.deepEqual(clips(result).map(clip => [clip.start, clip.duration]), [
		[0, 5],
		[5, 4],
		[9, 3]
	]);
});

test('rate stretch preserves source span and changes visible duration', () => {
	const result = rateStretchMovieClip(project(), selection, { rate: 2 });
	assert.equal(clips(result)[1].sourceSpan, 4);
	assert.equal(clips(result)[1].playbackRate, 2);
	assert.equal(clips(result)[1].duration, 2);
});

test('ripple trim shifts following clips only for end-edge changes', () => {
	const end = rippleTrimMovieClip(
		project(),
		selection,
		{ delta: -1, edge: 'end' }
	);
	assert.deepEqual(clips(end).map(clip => [clip.start, clip.duration]), [
		[0, 4],
		[4, 3],
		[7, 4]
	]);
	const start = rippleTrimMovieClip(
		project(),
		selection,
		{ delta: 1, edge: 'start' }
	);
	assert.deepEqual(clips(start).map(clip => [clip.start, clip.duration]), [
		[0, 4],
		[5, 3],
		[8, 4]
	]);
});
