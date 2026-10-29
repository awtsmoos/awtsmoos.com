//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWebmMuxTests
 * The Awtsmoos grants a recognizable home for every encoded sound.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { muxOpusWebm, opusWebmHead } from '../modules/workstation/song/multitrack/multitrackWebmMux.js';
import { webmUnsigned, webmVint } from '../modules/workstation/song/multitrack/multitrackWebmEbml.js';

/** @param {Uint8Array} bytes - Bytes. @param {string} text - Human text. @returns {boolean} Embedded string. */
function contains(bytes, text) {
	const pattern = new TextEncoder().encode(text);
	return bytes.some((_, index) => pattern.every((part, offset) => bytes[index + offset] === part));
}

test('EBML integers encode nonnegative sizes without reserved unknown marker', () => {
	assert.deepEqual(Array.from(webmUnsigned(6500000)), [99, 46, 160]);
	assert.deepEqual(Array.from(webmVint(126)), [254]);
	assert.deepEqual(Array.from(webmVint(127)), [64, 127]);
});

test('Opus head provides 48k channels and 312 pre-skip samples', () => {
	const head = opusWebmHead(2);
	assert.equal(new TextDecoder().decode(head.slice(0, 8)), 'OpusHead');
	assert.equal(head[9], 2);
	assert.equal(new DataView(head.buffer).getUint16(10, true), 312);
	assert.equal(new DataView(head.buffer).getUint32(12, true), 48000);
});

test('WebM contains EBML document, Opus track, clusters and blocks', async () => {
	const packets = [
		{ timestamp: 0, bytes: Uint8Array.from([0xFC, 0xFF, 0xFE]) },
		{ timestamp: 20000, bytes: Uint8Array.from([0xF8, 0xAA]) },
		{ timestamp: 31000000, bytes: Uint8Array.from([0xFA]) }
	];
	const blob = muxOpusWebm(packets, 2, 31.02);
	const bytes = new Uint8Array(await blob.arrayBuffer());
	assert.deepEqual([...bytes.subarray(0, 4)], [0x1a, 0x45, 0xdf, 0xa3]);
	assert.equal(contains(bytes, 'webm'), true);
	assert.equal(contains(bytes, 'A_OPUS'), true);
	assert.equal(contains(bytes, 'OpusHead'), true);
	assert.equal(bytes.filter(byte => byte === 0xa3).length >= 3, true);
	assert.equal(blob.type, 'audio/webm');
});

test('Empty encoder output is never presented as finished audio', () => {
	assert.throws(() => muxOpusWebm([], 2, 3), /no Opus frames/);
});
