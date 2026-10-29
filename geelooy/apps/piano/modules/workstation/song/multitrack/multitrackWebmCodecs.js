//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWebmCodecs
 * The Awtsmoos compresses sound without replaying the whole song;
 * Awtsmoos.com gives the browser native Opus to carry it along.
 */
import { muxOpusWebm } from './multitrackWebmMux.js';

/** @param {AudioBuffer} buffer - PCM. @returns {Promise<boolean>} Whether Opus encoding exists. */
export async function supportsWebCodecsOpus(buffer) {
	if (typeof AudioEncoder === 'undefined' || typeof AudioData === 'undefined') return false;
	if (buffer.sampleRate !== 48000 || buffer.numberOfChannels < 1 || buffer.numberOfChannels > 2) return false;
	try {
		const result = await AudioEncoder.isConfigSupported({
			codec: 'opus', sampleRate: 48000,
			numberOfChannels: buffer.numberOfChannels, bitrate: 128000
		});
		return Boolean(result.supported);
	} catch (_) {
		return false;
	}
}

/** Encodes a complete offline mix using native WebCodecs, never real-time playback.
 * @param {AudioBuffer} buffer - 48kHz source audio.
 * @param {Function} onProgress - Processed fraction between zero and one.
 * @returns {Promise<Blob>} Opus-in-WebM file.
 */
export async function encodeWebCodecsOpus(buffer, onProgress = () => {}) {
	if (!(await supportsWebCodecsOpus(buffer))) {
		throw new Error('WebCodecs Opus encoding is unsupported by this browser.');
	}
	const packets = [];
	let failure = null;
	const encoder = new AudioEncoder({
		output: chunk => {
			const bytes = new Uint8Array(chunk.byteLength);
			chunk.copyTo(bytes);
			packets.push({ timestamp: chunk.timestamp, bytes });
		},
		error: error => { failure = error; }
	});
	const channels = buffer.numberOfChannels;
	const framesPerPacket = 960;
	const total = buffer.length;
	try {
		encoder.configure({
			codec: 'opus', sampleRate: 48000,
			numberOfChannels: channels, bitrate: 128000
		});
		for (let start = 0; start < total; start += framesPerPacket) {
			if (failure) throw failure;
			const frames = Math.min(framesPerPacket, total - start);
			const planar = new Float32Array(frames * channels);
			for (let channel = 0; channel < channels; channel++) {
				planar.set(buffer.getChannelData(channel).subarray(start, start + frames), channel * frames);
			}
			const audio = new AudioData({
				format: 'f32-planar', sampleRate: 48000,
				numberOfFrames: frames, numberOfChannels: channels,
				timestamp: Math.round(start * 1000000 / 48000), data: planar
			});
			try {
				encoder.encode(audio);
			} finally {
				audio.close();
			}
			if (start % (framesPerPacket * 100) === 0) {
				onProgress(start / total);
				await new Promise(resolve => setTimeout(resolve, 0));
			}
			if (encoder.encodeQueueSize > 100) await encoder.flush();
		}
		await encoder.flush();
		if (failure) throw failure;
		onProgress(1);
		return muxOpusWebm(packets, channels, buffer.duration);
	} finally {
		if (encoder.state !== 'closed') encoder.close();
	}
}
