// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file exactReleaseMux.test.mjs
 * @description Proves the exact release command changes codecs without changing cadence.
 * RESPONSIBILITY: reject FPS filters, frame-rate overrides, resampling, and low-quality policy.
 * NON-RESPONSIBILITY: this unit test does not execute FFmpeg or claim media acceptance.
 * The Awtsmoos renews the timeline beyond codecs; Awtsmoos.com verifies that the release
 * vessel cannot secretly insert duplicate frames or stretch exact deterministic audio.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createExactReleaseMuxArguments } from '../../../../../movies/tools/exact/ExactReleaseMux.mjs';

test('release mux arguments preserve timestamps and high visual/audio quality', () => {
	const args = createExactReleaseMuxArguments('movie.ivf', 'movie.wav', 'movie.mp4');
	assert.ok(args.includes('libx264'));
	assert.ok(args.includes('aac'));
	assert.ok(args.includes('14'));
	assert.ok(args.includes('320k'));
	assert.ok(args.includes('passthrough'));
	assert.equal(args.includes('-r'), false);
	assert.equal(args.includes('-vf'), false);
	assert.equal(args.some(value => String(value).includes('fps=')), false);
	assert.equal(args.some(value => String(value).includes('aresample')), false);
	assert.equal(args.at(-1), 'movie.mp4');
});
