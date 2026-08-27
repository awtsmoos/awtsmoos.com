import assert from 'node:assert/strict';
import { createWebmMuxer, finalizeWebmTarget } from '../modules/recording/webmMuxerFactory.js';
import { targetBuffer } from '../modules/recording/container/webmTarget.js';
import { assertAscii, assertDurationElement, assertIdCountAtLeast, assertOpusHeadLittleEndian } from './helpers/webmByteAssertions.mjs';

const profile = { muxCodec:'V_VP8', mimeCodec:'vp8' };
const audio = { active:true, sampleRate:48000, numberOfChannels:2 };
const { muxer, target, engine } = await createWebmMuxer({ width:640, height:360, fps:30, video:profile, audio });
assert.equal(engine, 'local-webm');

for (let i = 0; i < 450; i++) {
  muxer.addVideoChunk(fakeChunk(i * 33333, i % 30 === 0 ? 'key' : 'delta', 90 + (i % 17), i), {});
  muxer.addAudioChunk(fakeChunk(i * 33333 + 1000, 'key', 28 + (i % 5), 2000 + i), {});
}

muxer.finalize();
const bytes = new Uint8Array(targetBuffer(target));
assert.ok(bytes.length > 60000, `local WebM unexpectedly small: ${bytes.length}`);
assert.deepEqual([...bytes.slice(0, 4)], [0x1a,0x45,0xdf,0xa3]);
assertAscii(bytes, 'webm');
assertAscii(bytes, 'V_VP8');
assertAscii(bytes, 'A_OPUS');
assertDurationElement(bytes);
assertOpusHeadLittleEndian(bytes);
assertIdCountAtLeast(bytes, [0x1f,0x43,0xb6,0x75], 3, 'Cluster');
const blob = finalizeWebmTarget(target, 'vp8,opus');
assert.equal(blob.type, 'video/webm;codecs=vp8,opus');
console.log(`B"H local WebM muxer stress passed: ${bytes.length} bytes`);

function fakeChunk(timestamp, type, size, seed) {
  const data = new Uint8Array(size);
  for (let i = 0; i < size; i++) data[i] = (seed + i * 13) & 255;
  return { timestamp, type, byteLength:data.length, copyTo:dest => dest.set(data) };
}
