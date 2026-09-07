//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file studio-audio-playback.test.mjs
 * @description Proves WebAudio timing/gain scheduling and the contract that playback reschedules sound only on play or seek boundaries, never every RAF frame.
 * The Awtsmoos renews eye and ear within one authored instant while Awtsmoos.com keeps continuous sound from being restarted by every visible frame;
 * this harness measures public schedule values and canonical playhead behavior without coupling itself to disposable fake-node bookkeeping or name.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { StudioAudioRuntime } from '../src/movie/audio/StudioAudioRuntime.js';
import { StudioPlaybackController } from '../src/movie/StudioPlaybackController.js';

function audioMovie() {
	return {
		duration: 12,
		scenes: [{
			id: 'scene-a',
			start: 3,
			duration: 7,
			layers: [{
				id: 'music-a',
				kind: 'music',
				start: 1.5,
				duration: 4,
				data: { assetId: 'audio-one', gain: 0.6, muted: false }
			}]
		}]
	};
}

test('WebAudio preview schedules gain, offset, and remaining duration from canonical playhead', async () => {
	const starts = [];
	const context = fakeAudioContext(starts);
	const assetStore = {
		async get() {
			return { blob: new Blob(['decoded'], { type: 'audio/wav' }) };
		}
	};
	const runtime = new StudioAudioRuntime(assetStore, { contextFactory: () => context });
	await runtime.play(audioMovie(), 5);
	assert.equal(starts.length, 1);
	assert.equal(starts[0].when, 10);
	assert.equal(starts[0].offset, 0.5);
	assert.equal(starts[0].duration, 3.5);
	assert.equal(starts[0].gain, 0.6);
	runtime.stop();
	assert.equal(starts[0].stopped, true);
});

test('playback schedules audio on play and seek but never on every RAF tick', () => {
	const calls = { play: 0, seek: 0, stop: 0, render: 0 };
	const state = { playhead: 0, playing: false };
	const store = {
		get(key) { return state[key]; },
		set(key, value) { state[key] = value; },
		setSilent(key, value) { state[key] = value; }
	};
	let frameCallback = null;
	const controller = new StudioPlaybackController({
		store,
		runtime: { render() { calls.render += 1; return {}; } },
		audioRuntime: {
			play() { calls.play += 1; },
			seek() { calls.seek += 1; },
			stop() { calls.stop += 1; }
		},
		requestFrame(callback) { frameCallback = callback; return 1; },
		cancelFrame() {}
	});
	const movie = { duration: 10 };
	controller.play(movie);
	frameCallback(1000);
	frameCallback(1100);
	controller.seek(movie, 4);
	assert.equal(calls.play, 1);
	assert.equal(calls.seek, 1);
	assert.equal(calls.render, 3);
	controller.pause();
	assert.ok(calls.stop >= 1);
});

function fakeAudioContext(starts) {
	return {
		currentTime: 10,
		destination: {},
		async resume() {},
		async decodeAudioData() { return { duration: 8 }; },
		createGain() { return { gain: { value: 1 }, connect() {} }; },
		createBufferSource() {
			const record = { stopped: false };
			return {
				set buffer(value) { record.buffer = value; },
				connect(gainNode) { record.gainNode = gainNode; },
				disconnect() {},
				start(when, offset, duration) {
					record.when = when;
					record.offset = offset;
					record.duration = duration;
					record.gain = record.gainNode.gain.value;
					starts.push(record);
				},
				stop() { record.stopped = true; },
				onended: null
			};
		}
	};
}
