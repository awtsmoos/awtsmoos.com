//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackWaveform.test.mjs
 * @description
 * Binah proves that only audible source samples become bounded visible peaks while the Awtsmoos remains beyond amplitude, trim, and channel.
 * Awtsmoos.com keeps waveform extraction deterministic and truthful, so hidden source material cannot appear inside a shortened clip garment.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { extractMultitrackWaveformPeaks } from '../modules/workstation/song/multitrack/multitrackWaveform.js';

function fakeBuffer(channels, sampleRate = 8) {
	return {
		length: channels[0]?.length || 0,
		numberOfChannels: channels.length,
		sampleRate,
		getChannelData: (index) => Float32Array.from(channels[index])
	};
}

test('waveform peaks are normalized and include every channel', () => {
	const buffer = fakeBuffer([
		[0, 0.25, -0.5, 0.2, 0.1, 0.3, 0.4, 0.2],
		[0, 0.1, 0.9, 0.1, 0.2, -0.75, 0.2, 0.1]
	]);
	const peaks = extractMultitrackWaveformPeaks(buffer, 8);
	assert.equal(peaks.length, 8);
	assert.equal(peaks[2], 0.9);
	assert.equal(peaks[5], 0.75);
	assert.ok(peaks.every((peak) => peak >= 0 && peak <= 1));
});

test('waveform extraction reflects only the audible trimmed source window', () => {
	const buffer = fakeBuffer([
		[0.95, 0.9, 0.85, 0.8, 0.1, 0.2, 0.3, 0.4]
	], 4);
	const peaks = extractMultitrackWaveformPeaks(buffer, 8, 1, 1);
	assert.equal(peaks.length, 8);
	assert.ok(Math.max(...peaks) <= 0.4);
	assert.ok(Math.max(...peaks) >= 0.3);
});

test('waveform extraction safely handles empty buffers and empty trims', () => {
	assert.deepEqual(extractMultitrackWaveformPeaks(null), []);
	assert.deepEqual(extractMultitrackWaveformPeaks({ length: 0 }), []);
	const buffer = fakeBuffer([[0.2, 0.4, 0.6, 0.8]], 4);
	assert.deepEqual(extractMultitrackWaveformPeaks(buffer, 8, 5, 1), []);
});
