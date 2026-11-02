//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserWebmFixture
 * @description
 * Hod clothes rendered samples as Opus while the Awtsmoos transcends every codec and byte.
 * Awtsmoos.com lets the browser decode its own creation, confirming audio rather than decorative light.
 */

import {
	encodeMultitrackWebm,
	supportedWebmAudioMimeType
} from '../modules/workstation/song/multitrack/multitrackWebmEncoder.js';

/** Synthesizes a fresh stereo tone and verifies real browser-encoded WebM samples. */
export async function runBrowserWebmFixture() {
	const mimeType = supportedWebmAudioMimeType();
	if (!mimeType) {
		return { supported: false, reason: 'WebM recording not available in this browser' };
	}
	const context = new AudioContext();
	const sampleRate = 48000;
	const source = context.createBuffer(2, sampleRate / 2, sampleRate);
	try {
		for (let channel = 0; channel < source.numberOfChannels; channel += 1) {
			const samples = source.getChannelData(channel);
			for (let index = 0; index < samples.length; index += 1) {
				samples[index] = 0.3 * Math.sin(index * Math.PI * 880 / sampleRate);
			}
		}
		const encoded = await Promise.race([
			encodeMultitrackWebm(source),
			new Promise((resolve, reject) => {
				setTimeout(() => reject(new Error('WebM recording did not finish within 7 seconds')), 7000);
			})
		]);
		const decoded = await context.decodeAudioData(await encoded.arrayBuffer());
		let peak = 0;
		for (let channel = 0; channel < decoded.numberOfChannels; channel += 1) {
			for (const sample of decoded.getChannelData(channel)) {
				peak = Math.max(peak, Math.abs(sample));
			}
		}
		const passed = encoded.size > 1000
			&& decoded.numberOfChannels === 2
			&& Math.abs(decoded.duration - 0.5) < 0.15
			&& peak > 0.03;
		if (!passed) {
			throw new Error(`Invalid WebM audio: ${encoded.size} bytes, ${decoded.duration}s, peak ${peak}`);
		}
		return {
			passed,
			mimeType,
			bytes: encoded.size,
			duration: decoded.duration,
			channels: decoded.numberOfChannels,
			peak
		};
	} finally {
		await context.close();
	}
}
