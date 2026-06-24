/* B"H */
import assert from 'node:assert/strict';
import { createCodecCapabilities, summarizeCapabilities } from '../modules/webcodecs/CodecCapabilities.js';
import { createFramePool, pushFrame, takeFrame, drainFramePool } from '../modules/webcodecs/FramePool.js';
import { createAudioFramePool, pushAudioFrame, drainAudioFramePool } from '../modules/webcodecs/AudioFramePool.js';
import { createEncodedPacketQueue, enqueuePacket, dequeuePacket, queueDuration } from '../modules/webcodecs/EncodedPacketQueue.js';
import { createVideoEncoderManager, configureVideoEncoder } from '../modules/webcodecs/VideoEncoderManager.js';
import { createAudioEncoderManager, configureAudioEncoder } from '../modules/webcodecs/AudioEncoderManager.js';
const caps = createCodecCapabilities();
assert.equal(caps.environment.hasVideoEncoder, !!globalThis.VideoEncoder);
assert.deepEqual(summarizeCapabilities(caps).video, []);
let closed = 0; const frame = { close(){ closed += 1; } };
const pool = createFramePool({ maxSize:1 }); pushFrame(pool, frame); pushFrame(pool, { close(){ closed += 1; } }); assert.equal(closed, 1); assert.ok(takeFrame(pool)); drainFramePool(pool);
const audioPool = createAudioFramePool({ maxSize:1 }); pushAudioFrame(audioPool, { close(){ closed += 1; } }); pushAudioFrame(audioPool, { close(){ closed += 1; } }); drainAudioFramePool(audioPool); assert.ok(closed >= 3);
const queue = createEncodedPacketQueue({ maxPackets:2 }); enqueuePacket(queue, { timestamp:0, byteLength:10 }); enqueuePacket(queue, { timestamp:10, byteLength:15 }); enqueuePacket(queue, { timestamp:20, byteLength:20 }); assert.equal(queue.dropped, 1); assert.equal(queueDuration(queue), 10); assert.equal(dequeuePacket(queue).byteLength, 15);
const video = await configureVideoEncoder(createVideoEncoderManager({ width:320, height:180 })); assert.ok(['unavailable','configured'].includes(video.status));
const audio = await configureAudioEncoder(createAudioEncoderManager()); assert.ok(['unavailable','configured'].includes(audio.status));
console.log(JSON.stringify({ ok:true, videoStatus:video.status, audioStatus:audio.status, packets:queue.packets.length }));
