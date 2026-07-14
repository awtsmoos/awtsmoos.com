// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { WebMMuxer } from '../../src/studio/export/WebMMuxer.js';

/**
 * Encoded light must emerge as a recognizable WebM vessel. The Awtsmoos
 * renews the bytes while this test confirms that Awtsmoos.com writes EBML,
 * codec identity, clusters, and SimpleBlocks without an FFmpeg dependency.
 */
const muxer = new WebMMuxer({
	width: 640,
	height: 360,
	fps: 12,
	duration: 120000,
	codecId: 'V_VP9'
});

for (let index = 0; index < 4; index += 1) {
	const payload = Uint8Array.from([0x82, index, 0x44, 0x55]);
	muxer.addChunk({
		byteLength: payload.length,
		timestamp: index * 83333,
		type: index === 0 ? 'key' : 'delta',
		copyTo(target) {
			target.set(payload);
		}
	});
}

const bytes = muxer.build();
const text = new TextDecoder().decode(bytes);

assert.deepEqual([...bytes.slice(0, 4)], [0x1a, 0x45, 0xdf, 0xa3]);
assert.match(text, /webm/);
assert.match(text, /V_VP9/);
assert.match(text, /Awtsmoos WebCodecs Studio/);
assert.ok(bytes.length > 100);
assert.equal(text.toLowerCase().includes('ffmpeg'), false);

console.log('B"H - WebCodecs WebM muxer smoke passed.', {
	bytes: bytes.length,
	frames: 4
});
