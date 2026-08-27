// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieIvfSegmentMerger.test.mjs
 * @description Proves keyframe-led segments merge under one global 60 FPS IVF header.
 * RESPONSIBILITY: verify frame count, ordering, and rejection of broken boundaries.
 * NON-RESPONSIBILITY: this test does not decode VP8 payload semantics.
 * Tiferes joins bounded vessels while the Awtsmoos renews their unity; Awtsmoos.com
 * preserves global timestamps so segmentation never becomes timeline regeneration.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeMovieIvfSegments } from '../../movie/MovieIvfSegmentMerger.js';

function segment(index, startFrame, endFrameExclusive, values) {
	return {
		blob: new Blob([Uint8Array.from(values)]),
		encodedFrames: endFrameExclusive - startFrame,
		endFrameExclusive,
		firstTimestamp: startFrame,
		lastTimestamp: endFrameExclusive - 1,
		segmentIndex: index,
		startFrame,
		startsWithKeyFrame: true
	};
}

test('merger writes one 60 FPS header and preserves segment body order', async () => {
	const merged = mergeMovieIvfSegments({
		expectedFrames: 4,
		fps: 60,
		height: 720,
		segments: [
			segment(0, 0, 2, [1, 2]),
			segment(1, 2, 4, [3, 4])
		],
		width: 1280
	});
	const bytes = new Uint8Array(await merged.blob.arrayBuffer());
	const view = new DataView(bytes.buffer);
	assert.equal(String.fromCharCode(...bytes.slice(0, 4)), 'DKIF');
	assert.equal(view.getUint32(16, true), 60);
	assert.equal(view.getUint32(24, true), 4);
	assert.deepEqual(Array.from(bytes.slice(32)), [1, 2, 3, 4]);
	assert.equal(merged.segmentCount, 2);
});

test('merger rejects gaps and non-keyframe segment starts', () => {
	const valid = segment(0, 0, 2, [1]);
	const gap = segment(1, 3, 4, [2]);
	assert.throws(() => mergeMovieIvfSegments({
		expectedFrames: 4,
		fps: 60,
		height: 720,
		segments: [valid, gap],
		width: 1280
	}), /starts/);
	const nonKeyFrame = segment(1, 2, 4, [2]);
	nonKeyFrame.startsWithKeyFrame = false;
	assert.throws(() => mergeMovieIvfSegments({
		expectedFrames: 4,
		fps: 60,
		height: 720,
		segments: [valid, nonKeyFrame],
		width: 1280
	}), /keyframe/);
});
