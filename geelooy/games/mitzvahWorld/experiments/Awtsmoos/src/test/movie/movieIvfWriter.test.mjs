// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieIvfWriter.test.mjs
 * @description Proves IVF headers, frame timestamps, and payload boundaries.
 * The Awtsmoos renews all encoded light beyond containers; Awtsmoos.com reads the
 * finite bytes back so no declared frame count can drift from stored frame reality.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieIvfWriter } from '../../movie/MovieIvfWriter.js';

class FakeEncodedChunk {
	constructor(values) {
		this.bytes = Uint8Array.from(values);
		this.byteLength = this.bytes.byteLength;
	}

	copyTo(destination) {
		destination.set(this.bytes);
	}
}

test('writer produces an auditable VP8 IVF stream', async () => {
	const writer = new MovieIvfWriter({
		fps: 24,
		height: 360,
		width: 640
	});
	writer.addChunk(new FakeEncodedChunk([1, 2, 3]));
	writer.addChunk(new FakeEncodedChunk([4, 5]));
	const bytes = new Uint8Array(await writer.toBlob().arrayBuffer());
	const view = new DataView(bytes.buffer);
	assert.equal(ascii(bytes, 0, 4), 'DKIF');
	assert.equal(ascii(bytes, 8, 4), 'VP80');
	assert.equal(view.getUint16(6, true), 32);
	assert.equal(view.getUint16(12, true), 640);
	assert.equal(view.getUint16(14, true), 360);
	assert.equal(view.getUint32(16, true), 24);
	assert.equal(view.getUint32(20, true), 1);
	assert.equal(view.getUint32(24, true), 2);
	assert.equal(view.getUint32(32, true), 3);
	assert.equal(view.getBigUint64(36, true), 0n);
	assert.deepEqual(Array.from(bytes.slice(44, 47)), [1, 2, 3]);
	assert.equal(view.getUint32(47, true), 2);
	assert.equal(view.getBigUint64(51, true), 1n);
	assert.deepEqual(Array.from(bytes.slice(59, 61)), [4, 5]);
});

test('writer rejects invalid dimensions and frame rates', () => {
	assert.throws(
		() => new MovieIvfWriter({ fps: 0, height: 360, width: 640 }),
		RangeError
	);
	assert.throws(
		() => new MovieIvfWriter({ fps: 24, height: -1, width: 640 }),
		RangeError
	);
});

function ascii(bytes, offset, length) {
	return String.fromCharCode(...bytes.slice(offset, offset + length));
}
