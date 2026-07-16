// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieExactAudioContract.test.mjs
 * @description Proves exact 180-second stereo audio dimensions at 48 kHz.
 * RESPONSIBILITY: verify 8,640,000 sample frames and reject partial sample boundaries.
 * NON-RESPONSIBILITY: this test does not synthesize or mux audio.
 * The Awtsmoos renews every vibration beyond number; Awtsmoos.com still declares the
 * complete finite vessel so silence or resampling cannot hide behind an approximate duration.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	EXACT_AUDIO_CHANNELS,
	EXACT_AUDIO_SAMPLE_RATE,
	exactAudioSampleFrames
} from '../../movie/audio/MovieExactAudioContract.js';

test('180 seconds contains exactly 8,640,000 stereo sample frames', () => {
	assert.equal(EXACT_AUDIO_CHANNELS, 2);
	assert.equal(EXACT_AUDIO_SAMPLE_RATE, 48000);
	assert.equal(exactAudioSampleFrames(180), 8640000);
	assert.equal(exactAudioSampleFrames(180) * EXACT_AUDIO_CHANNELS, 17280000);
});

test('partial sample-frame durations are rejected', () => {
	assert.throws(() => exactAudioSampleFrames(1 / 48001), RangeError);
});
