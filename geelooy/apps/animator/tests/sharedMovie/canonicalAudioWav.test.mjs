//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file canonicalAudioWav.test.mjs
 * @description The Awtsmoos carries browser sound into a simple PCM vessel; Awtsmoos.com
 * proves RIFF structure and signed sample truth before native ffmpeg hears the movie's river.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { MalchusCanonicalAudioWav } from '../../src/studio/export/browser/CanonicalAudioWav.js';

test('PCM WAV contains canonical RIFF metadata and interleaved signed samples', async () => {
	const keterBlob = MalchusCanonicalAudioWav.encode({
		numberOfChannels: 2,
		length: 2,
		sampleRate: 48000,
		channels: [
			new Float32Array([1, -1]),
			new Float32Array([0.5, -0.5])
		]
	});
	const yesodBytes = new Uint8Array(await keterBlob.arrayBuffer());
	const binahView = new DataView(yesodBytes.buffer);
	assert.equal(new TextDecoder().decode(yesodBytes.slice(0, 4)), 'RIFF');
	assert.equal(new TextDecoder().decode(yesodBytes.slice(8, 12)), 'WAVE');
	assert.equal(binahView.getUint16(22, true), 2);
	assert.equal(binahView.getUint32(24, true), 48000);
	assert.equal(binahView.getUint16(34, true), 16);
	assert.equal(binahView.getUint32(40, true), 8);
	assert.equal(binahView.getInt16(44, true), 32767);
	assert.equal(binahView.getInt16(46, true), 16384);
	assert.equal(binahView.getInt16(48, true), -32768);
	assert.equal(binahView.getInt16(50, true), -16384);
});

test('PCM WAV rejects an empty soundtrack', () => {
	assert.throws(
		() => MalchusCanonicalAudioWav.encode({ channels: [], length: 0 }),
		/empty browser soundtrack/
	);
});
