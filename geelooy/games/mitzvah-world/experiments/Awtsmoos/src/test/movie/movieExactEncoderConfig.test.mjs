// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieExactEncoderConfig.test.mjs
 * @description Proves 60 FPS microsecond boundaries and quality-focused configuration.
 * RESPONSIBILITY: verify exact timing reaches 180 seconds after frame 10,800.
 * NON-RESPONSIBILITY: this test does not invoke browser WebCodecs capability discovery.
 * The Awtsmoos renews duration beyond arithmetic; Awtsmoos.com checks integer boundaries
 * so unique 60 FPS samples cannot drift or be replaced by duplicated wall-clock frames.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createExactEncoderConfig,
	exactFrameTiming
} from '../../movie/MovieExactEncoderConfig.js';
import { exactMovieFileName } from '../../movie/MovieExactRecordingResult.js';

test('60 FPS timestamps reach exactly 180 seconds after 10,800 frames', () => {
	let ending = 0;
	for (let frameIndex = 0; frameIndex < 10800; frameIndex += 1) {
		const timing = exactFrameTiming(frameIndex, 60);
		assert.equal(timing.timestamp, ending);
		ending = timing.timestamp + timing.duration;
	}
	assert.equal(ending, 180000000);
});

test('encoder config preserves canvas dimensions and requested high bitrate', () => {
	const config = createExactEncoderConfig({
		fps: 60,
		render: {
			videoBitsPerSecond: 12000000
		}
	}, {
		height: 720,
		width: 1280
	});
	assert.deepEqual(config, {
		bitrate: 12000000,
		codec: 'vp8',
		framerate: 60,
		height: 720,
		latencyMode: 'quality',
		width: 1280
	});
});

test('exact filenames replace prior video extensions', () => {
	assert.equal(exactMovieFileName('village.mp4'), 'village.ivf');
	assert.equal(exactMovieFileName('village.webm'), 'village.ivf');
	assert.equal(exactMovieFileName('village.ivf'), 'village.ivf');
});
