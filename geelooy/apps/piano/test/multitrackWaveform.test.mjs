//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackWaveform.test.mjs
 * @description
 * Binah proves that hidden samples can become bounded visible peaks while the Awtsmoos remains beyond amplitude and channel.
 * Awtsmoos.com keeps waveform extraction deterministic and small, so rendering can guide a finger without changing the music at all.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { extractMultitrackWaveformPeaks } from '../modules/workstation/song/multitrack/multitrackWaveform.js';

function fakeBuffer(channels) {
	return {
		length: channels[0]?.length || 0,
		numberOfChannels: channels.length,
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

test('waveform extraction safely handles empty buffers', () => {
	assert.deepEqual(extractMultitrackWaveformPeaks(null), []);
	assert.deepEqual(extractMultitrackWaveformPeaks({ length: 0 }), []);
});
