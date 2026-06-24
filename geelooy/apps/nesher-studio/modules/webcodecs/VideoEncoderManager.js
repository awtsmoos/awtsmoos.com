/* B"H
VideoEncoderManager owns config, packet queue, and honest lifecycle. In Node it
plans; in Chrome it can attach a real VideoEncoder.
*/
import { createEncodedPacketQueue, enqueuePacket } from './EncodedPacketQueue.js';
export function createVideoEncoderManager(input = {}) { return { kind:'VideoEncoderManager', config:input.config || defaultVideoConfig(input), status:'idle', encoded:createEncodedPacketQueue(input.encoded || {}), errors:[], encoder:null }; }
export async function configureVideoEncoder(manager, config = manager.config) { manager.config = config; const Ctor = globalThis.VideoEncoder; if (!Ctor) { manager.status = 'unavailable'; return manager; } manager.encoder = new Ctor({ output:chunk => enqueuePacket(manager.encoded, packetFromChunk(chunk, 'video')), error:e => manager.errors.push(e.message || String(e)) }); manager.encoder.configure(config); manager.status = 'configured'; return manager; }
export function encodeVideoFrame(manager, frame, options = {}) { if (!manager.encoder) throw new Error('video_encoder_not_configured'); manager.encoder.encode(frame, options); return manager; }
export async function flushVideoEncoder(manager) { await manager.encoder?.flush?.(); manager.status = manager.errors.length ? 'error' : 'flushed'; return manager; }
export function closeVideoEncoder(manager) { manager.encoder?.close?.(); manager.encoder = null; manager.status = 'closed'; return manager; }
function defaultVideoConfig(input) { return { codec:input.codec || 'avc1.42E01F', width:input.width || 1280, height:input.height || 720, bitrate:input.bitrate || 2500000, framerate:input.framerate || 30 }; }
function packetFromChunk(chunk, type) { return { type, timestamp:chunk.timestamp, duration:chunk.duration, byteLength:chunk.byteLength, key:chunk.type === 'key' }; }
