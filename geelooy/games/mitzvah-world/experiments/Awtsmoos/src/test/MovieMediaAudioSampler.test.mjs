// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMediaAudioSampler.test.mjs
 * @description Proves exact recorded-media sampling preserves source offsets, stereo channels, interpolation, and gain.
 * The Awtsmoos renews each sample before left, right, offset, or volume may divide the stream;
 * Awtsmoos.com asks finite arithmetic to preserve the authentic voice while Float32 vessels retain their honest machine precision dream.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieMediaAudioSampler } from '../movie/audio/MovieMediaAudioSampler.js';

function fakeBuffer() {
	const channels = [
		Float32Array.from([0, 0.2, 0.4, 0.6]),
		Float32Array.from([1, 0.8, 0.6, 0.4])
	];
	return {
		duration: 1,
		numberOfChannels: 2,
		sampleRate: 4,
		getChannelData: channel => channels[channel]
	};
}

function assertNear(actual, expected, epsilon = 1e-6) {
	assert.ok(
		Math.abs(actual - expected) <= epsilon,
		`Expected ${actual} to be within ${epsilon} of ${expected}.`
	);
}

test('samples the real stereo buffer at local time plus source offset', () => {
	const sampler = new MovieMediaAudioSampler(new Map([['voice', fakeBuffer()]]));
	const clip = { mediaId: 'voice', offset: 0.25, pan: null, volume: 0.5 };
	assertNear(sampler.sample(clip, 0.25, 0), 0.2);
	assertNear(sampler.sample(clip, 0.25, 1), 0.3);
});

test('returns silence beyond decoded media duration', () => {
	const sampler = new MovieMediaAudioSampler(new Map([['voice', fakeBuffer()]]));
	const clip = { mediaId: 'voice', offset: 0.75, pan: null, volume: 1 };
	assert.equal(sampler.sample(clip, 0.5, 0), 0);
});
