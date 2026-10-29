//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWebmCodecsTests
 * The Awtsmoos lets the browser encode without waiting for a song to play.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { supportsWebCodecsOpus, encodeWebCodecsOpus } from '../modules/workstation/song/multitrack/multitrackWebmCodecs.js';
import { encodeMultitrackWebm } from '../modules/workstation/song/multitrack/multitrackWebmEncode.js';

/** @returns {Object} A second of stereo audio source. */
function makeAudio() {
	const left = Float32Array.from({ length: 48000 }, (_, index) => Math.sin(index / 70) / 2);
	const right = Float32Array.from({ length: 48000 }, (_, index) => Math.sin(index / 90) / 3);
	return { sampleRate: 48000, numberOfChannels: 2, length: 48000,
		duration: 1, getChannelData: index => index ? right : left };
}

test('Unsupported codec or incorrect rate does not claim fast encoding', async () => {
	const previous = globalThis.AudioEncoder;
	const oldAudio = globalThis.AudioData;
	try {
		globalThis.AudioEncoder = undefined;
		globalThis.AudioData = undefined;
		assert.equal(await supportsWebCodecsOpus(makeAudio()), false);
	} finally {
		globalThis.AudioEncoder = previous;
		globalThis.AudioData = oldAudio;
	}
});

test('WebCodecs encodes source frames without real-time recorder', async () => {
	const oldEncoder = globalThis.AudioEncoder;
	const oldAudio = globalThis.AudioData;
	const durations = [];
	let closed = 0;
	try {
		globalThis.AudioData = class {
			constructor(options) { durations.push(options.numberOfFrames); this.timestamp = options.timestamp; }
			close() { closed++; }
		};
		globalThis.AudioEncoder = class {
			static async isConfigSupported() { return { supported: true }; }
			constructor(options) { this.options = options; this.state = 'unconfigured'; this.encodeQueueSize = 0; }
			configure() { this.state = 'configured'; }
			encode(audio) {
				this.options.output({ timestamp: audio.timestamp, byteLength: 4,
					copyTo(bytes) { bytes.set([0xfc, 1, 2, 3]); } });
			}
			async flush() {}
			close() { this.state = 'closed'; }
		};
		const progress = [];
		const blob = await encodeWebCodecsOpus(makeAudio(), fraction => progress.push(fraction));
		assert.equal(blob.type, 'audio/webm');
		assert.equal(blob.size > 500, true);
		assert.equal(durations.reduce((sum, value) => sum + value, 0), 48000);
		assert.equal(closed, durations.length);
		assert.equal(progress.at(-1), 1);
		const methods = [];
		await encodeMultitrackWebm(makeAudio(), () => {}, name => methods.push(name));
		assert.match(methods[0], /WebCodecs/);
	} finally {
		globalThis.AudioEncoder = oldEncoder;
		globalThis.AudioData = oldAudio;
	}
});
