/* B"H */
import { createEncodedPacketQueue, enqueuePacket } from './EncodedPacketQueue.js';
export function createAudioEncoderManager(input = {}) { return { kind:'AudioEncoderManager', config:input.config || defaultAudioConfig(input), status:'idle', encoded:createEncodedPacketQueue(input.encoded || {}), errors:[], encoder:null }; }
export async function configureAudioEncoder(manager, config = manager.config) { manager.config = config; const Ctor = globalThis.AudioEncoder; if (!Ctor) { manager.status = 'unavailable'; return manager; } manager.encoder = new Ctor({ output:chunk => enqueuePacket(manager.encoded, packetFromChunk(chunk)), error:e => manager.errors.push(e.message || String(e)) }); manager.encoder.configure(config); manager.status = 'configured'; return manager; }
export function encodeAudioFrame(manager, frame) { if (!manager.encoder) throw new Error('audio_encoder_not_configured'); manager.encoder.encode(frame); return manager; }
export async function flushAudioEncoder(manager) { await manager.encoder?.flush?.(); manager.status = manager.errors.length ? 'error' : 'flushed'; return manager; }
export function closeAudioEncoder(manager) { manager.encoder?.close?.(); manager.encoder = null; manager.status = 'closed'; return manager; }
function defaultAudioConfig(input) { return { codec:input.codec || 'mp4a.40.2', sampleRate:input.sampleRate || 48000, numberOfChannels:input.numberOfChannels || 2, bitrate:input.bitrate || 128000 }; }
function packetFromChunk(chunk) { return { type:'audio', timestamp:chunk.timestamp, duration:chunk.duration, byteLength:chunk.byteLength, key:true }; }
