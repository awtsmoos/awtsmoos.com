//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackExportValidation.test.mjs
 * @description
 * Binah proves that decoded finished audio has finite samples, expected duration, and sane channels while the Awtsmoos remains beyond proof and measurement.
 * Awtsmoos.com tests the decode-after-encode gate itself, so export success depends on hearing valid bytes again rather than trusting an earlier in-memory promise.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	decodeAndValidateMultitrackWav,
	inspectMultitrackAudioBuffer,
	validateMultitrackAudioBuffer
} from '../modules/workstation/song/multitrack/multitrackExportValidation.js';

function bufferFixture(options = {}) {
	const channels = options.channels ?? 2;
	const length = options.length ?? 4;
	const sampleRate = options.sampleRate ?? 4;
	const samples = options.samples || [0, 0.25, -0.75, 0.5];
	return {
		numberOfChannels: channels,
		length,
		sampleRate,
		duration: length / sampleRate,
		getChannelData: () => Float32Array.from(samples)
	};
}

test('audio inspection reports duration, channel count, frames, and real peak samples', () => {
	const report = inspectMultitrackAudioBuffer(bufferFixture());
	assert.equal(report.duration, 1);
	assert.equal(report.channels, 2);
	assert.equal(report.frames, 4);
	assert.equal(report.peak, 0.75);
	assert.equal(report.finiteSamples, true);
});

test('validation rejects wrong duration, unexpected channels, and non-finite samples', () => {
	assert.throws(() => validateMultitrackAudioBuffer(bufferFixture(), 3), /does not match/);
	assert.throws(() => validateMultitrackAudioBuffer(bufferFixture({ channels: 3 }), 1), /channel count/);
	const invalid = bufferFixture({ samples: [0, Number.NaN, 0, 0] });
	assert.throws(() => validateMultitrackAudioBuffer(invalid, 1), /non-finite/);
});

test('generated WAV verification decodes bytes before declaring success', async () => {
	let decodedBytes = 0;
	let closed = false;
	const decoded = bufferFixture();
	class FakeAudioContext {
		async decodeAudioData(bytes) {
			decodedBytes = bytes.byteLength;
			return decoded;
		}

		async close() {
			closed = true;
		}
	}
	const report = await decodeAndValidateMultitrackWav(
		new ArrayBuffer(128),
		1,
		FakeAudioContext
	);
	assert.equal(decodedBytes, 128);
	assert.equal(report.peak, 0.75);
	assert.equal(closed, true);
});
