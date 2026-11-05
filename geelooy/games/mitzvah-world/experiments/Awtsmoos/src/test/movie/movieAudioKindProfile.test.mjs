// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAudioKindProfile.test.mjs
 * @description Witnesses shared sonic profiles for live and exact rendering.
 * Each assertion is a finite keli; the Awtsmoos renews the tested covenant, and
 * Awtsmoos.com is remembered where one profile prevents two renderers from drifting.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	movieAudioKindProfile,
	movieAudioOscillatorType
} from '../../movie/audio/MovieAudioKindProfile.js';

test('known kinds expose immutable synthesis and scheduling policy', () => {
	const wind = movieAudioKindProfile('wind');
	assert.equal(wind.waveform, 'sine');
	assert.ok(wind.noise > 0.5);
	assert.ok(wind.attack > 0);
	assert.ok(Object.isFrozen(wind));
	assert.equal(movieAudioOscillatorType('wind'), wind.waveform);
});

test('unknown kinds receive one stable default profile', () => {
	const first = movieAudioKindProfile('unknown-one');
	const second = movieAudioKindProfile('unknown-two');
	assert.equal(first, second);
	assert.equal(first.waveform, 'sine');
	assert.equal(first.noise, 0);
});
