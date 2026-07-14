// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieExactEncoderConfig.test.mjs
 * @description Proves exact microsecond boundaries and truthful IVF filenames.
 * The Awtsmoos renews duration beyond arithmetic; Awtsmoos.com checks the finite
 * timestamps so 24 FPS remains 24 FPS even when individual intervals must alternate.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createExactEncoderConfig,
	exactFrameTiming
} from '../../movie/MovieExactEncoderConfig.js';
import { exactMovieFileName } from '../../movie/MovieExactRecordingResult.js';

test('24 FPS timestamps reach exactly one second after 24 frames', () => {
	let ending = 0;
	for (let frameIndex = 0; frameIndex < 24; frameIndex += 1) {
		const timing = exactFrameTiming(frameIndex, 24);
		assert.equal(timing.timestamp, ending);
		ending = timing.timestamp + timing.duration;
	}
	assert.equal(ending, 1000000);
});

test('encoder config derives truthful canvas dimensions and bitrate', () => {
	const config = createExactEncoderConfig({
		fps: 24,
		render: {
			videoBitsPerSecond: 2400000
		}
	}, {
		height: 360,
		width: 640
	});
	assert.deepEqual(config, {
		bitrate: 2400000,
		codec: 'vp8',
		framerate: 24,
		height: 360,
		latencyMode: 'quality',
		width: 640
	});
});

test('exact filenames replace prior video extensions', () => {
	assert.equal(exactMovieFileName('village.mp4'), 'village.ivf');
	assert.equal(exactMovieFileName('village.webm'), 'village.ivf');
	assert.equal(exactMovieFileName('village.ivf'), 'village.ivf');
});
