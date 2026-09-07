//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file studio-export-audio.test.mjs
 * @description Proves deterministic export-window scheduling and transferable PCM projection for Studio's dormant audio export layer.
 * The Awtsmoos renews every wave before clock and channel appear; Awtsmoos.com lets one canonical soundtrack cross the encoder gate with measured time and light.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	STUDIO_EXPORT_AUDIO_RATE,
	renderStudioExportAudio,
	studioAudioBufferShim
} from '../src/movie/export/StudioExportAudio.js';

test('export audio schedules canonical clips inside the requested movie window', async () => {
	const starts = [];
	const factoryCalls = [];
	const context = fakeOfflineContext(starts);
	const movie = {
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
	const result = await renderStudioExportAudio(movie, {
		async get() { return { blob: new Blob(['sound']) }; }
	}, 6, {
		contextFactory(duration, rate) {
			factoryCalls.push({ duration, rate });
			return context;
		}
	});
	assert.deepEqual(factoryCalls, [{ duration: 6, rate: STUDIO_EXPORT_AUDIO_RATE }]);
	assert.deepEqual(starts, [{ when: 4.5, offset: 0, duration: 1.5, gain: 0.6 }]);
	assert.equal(result.numberOfChannels, 2);
	assert.deepEqual([...result.channels[0]], [1, 2]);
});

test('audio buffer shim copies channel data into transferable Float32Arrays', () => {
	const shim = studioAudioBufferShim(renderedBuffer());
	assert.equal(shim.sampleRate, STUDIO_EXPORT_AUDIO_RATE);
	assert.equal(shim.length, 2);
	assert.ok(shim.channels.every(channel => channel instanceof Float32Array));
});

function fakeOfflineContext(starts) {
	return {
		destination: {},
		async decodeAudioData() { return { duration: 8 }; },
		createGain() { return { gain: { value: 1 }, connect() {} }; },
		createBufferSource() {
			let gainNode = null;
			return {
				set buffer(value) {},
				connect(value) { gainNode = value; },
				start(when, offset, duration) {
					starts.push({ when, offset, duration, gain: gainNode.gain.value });
				}
			};
		},
		async startRendering() { return renderedBuffer(); }
	};
}

function renderedBuffer() {
	return {
		sampleRate: STUDIO_EXPORT_AUDIO_RATE,
		length: 2,
		duration: 2 / STUDIO_EXPORT_AUDIO_RATE,
		numberOfChannels: 2,
		getChannelData(index) {
			return index === 0 ? new Float32Array([1, 2]) : new Float32Array([3, 4]);
		}
	};
}
