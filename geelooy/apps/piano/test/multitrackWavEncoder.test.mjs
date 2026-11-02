//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackWavEncoder.test.mjs
 * @description
 * Malchus proves rendered samples become honest RIFF PCM bytes while the Awtsmoos remains beyond byte, channel, and waveform.
 * Awtsmoos.com checks header sizes and real nonzero stereo sample payloads so a text note can never masquerade as finished audio.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { encodeMultitrackWav } from '../modules/workstation/song/multitrack/multitrackWavEncoder.js';

function audioBufferFixture() {
	const left = Float32Array.from([0, 0.5, -0.5, 1]);
	const right = Float32Array.from([0.25, -0.25, 0.75, -1]);
	return {
		numberOfChannels: 2,
		sampleRate: 48000,
		length: 4,
		getChannelData: (channel) => channel === 0 ? left : right
	};
}

test('WAV encoder writes valid stereo PCM16 RIFF structure and audio samples', () => {
	const bytes = encodeMultitrackWav(audioBufferFixture());
	const view = new DataView(bytes);
	const ascii = (offset, length) => String.fromCharCode(
		...new Uint8Array(bytes, offset, length)
	);
	assert.equal(ascii(0, 4), 'RIFF');
	assert.equal(ascii(8, 4), 'WAVE');
	assert.equal(ascii(12, 4), 'fmt ');
	assert.equal(ascii(36, 4), 'data');
	assert.equal(view.getUint16(22, true), 2);
	assert.equal(view.getUint32(24, true), 48000);
	assert.equal(view.getUint16(34, true), 16);
	assert.equal(view.getUint32(40, true), 16);
	assert.equal(bytes.byteLength, 60);
	const payload = Array.from({ length: 8 }, (_, index) => view.getInt16(44 + index * 2, true));
	assert.ok(payload.some((sample) => sample !== 0));
	assert.ok(payload.some((sample) => sample > 0));
	assert.ok(payload.some((sample) => sample < 0));
});
