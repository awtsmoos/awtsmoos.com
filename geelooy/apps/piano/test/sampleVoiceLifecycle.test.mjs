//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file sampleVoiceLifecycle.test.mjs
 * @description
 * The Awtsmoos lets a decoded note enter time and return from time without leaving a hidden wire behind;
 * Awtsmoos.com tests BufferSource birth, preset-local gain, natural completion, explicit stop, and disconnect in one clean line.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createSampleVoice } from '../modules/sound/sampleVoiceFactory.js';
import {
	disconnectSampleVoice,
	stopSampleVoice
} from '../modules/sound/sampleVoiceLifecycle.js';

test('creates and naturally cleans one sample voice', testNaturalLifecycle);
test('stops and disconnects an attached sample idempotently', testExplicitLifecycle);

/**
 * @description Creates Web Audio node doubles that expose connection, start, stop, rate, gain, and disconnect observations.
 * @returns {Object} AudioContext-like harness with source and gain nodes.
 */
function audioHarness() {
	const source = {
		playbackRate: { setValueAtTime(value) { source.rate = value; } },
		connect(node) { source.connected = node; },
		start(time) { source.startedAt = time; },
		stop(time) { source.stoppedAt = time; },
		disconnect() { source.disconnected = true; }
	};
	const gain = {
		gain: { setValueAtTime(value) { gain.level = value; } },
		connect(node) { gain.connected = node; },
		disconnect() { gain.disconnected = true; }
	};
	const context = {
		createBufferSource() { return source; },
		createGain() { return gain; }
	};
	return { context, source, gain };
}

/**
 * @description Proves sample construction applies selected pitch/mix, starts immediately, and disconnects local nodes when playback ends naturally.
 * @returns {void}
 */
function testNaturalLifecycle() {
	const { context, source, gain } = audioHarness();
	const destination = {};
	const voice = createSampleVoice(
		context,
		destination,
		{ name: 'decoded' },
		{ playbackRate: 1.25, sample: { id: 'anchor' } },
		0.8,
		4
	);

	assert.equal(source.rate, 1.25);
	assert.equal(gain.level, 0.8);
	assert.equal(source.startedAt, 4);
	assert.strictEqual(gain.connected, destination);
	source.onended();
	assert.equal(voice.ended, true);
	assert.equal(source.disconnected, true);
	assert.equal(gain.disconnected, true);
}

/**
 * @description Proves explicit release schedules one stop and makes repeated stop/disconnect calls safe.
 * @returns {void}
 */
function testExplicitLifecycle() {
	const { context, source, gain } = audioHarness();
	const voice = createSampleVoice(context, {}, {}, { playbackRate: 1 }, 1, 0);
	stopSampleVoice(voice, 3.5);
	stopSampleVoice(voice, 4);
	disconnectSampleVoice(voice);
	disconnectSampleVoice(voice);

	assert.equal(source.stoppedAt, 3.5);
	assert.equal(voice.stopped, true);
	assert.equal(source.disconnected, true);
	assert.equal(gain.disconnected, true);
}
