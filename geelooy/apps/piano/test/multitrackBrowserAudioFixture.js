//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserAudioFixture
 * @description
 * The Awtsmoos carries sound through finite browser vessels and back into proof.
 * Awtsmoos.com asks that WAV contain the song, not only a header dressed as truth.
 */

import { createMultitrackProject } from '../modules/workstation/song/multitrack/multitrackProject.js';
import { renderMultitrackProjectMix } from '../modules/workstation/song/multitrack/multitrackExportRenderer.js';
import { encodeMultitrackWav } from '../modules/workstation/song/multitrack/multitrackWavEncoder.js';
import { decodeAndValidateMultitrackWav } from '../modules/workstation/song/multitrack/multitrackExportValidation.js';

/** Makes one real in-browser mix, decodes its final WAV bytes, and verifies sound. */
export async function runBrowserAudioFixture() {
	const context = new AudioContext();
	const sampleRate = 48000;
	const buffer = context.createBuffer(2, sampleRate, sampleRate);
	for (let channel = 0; channel < 2; channel += 1) {
		const samples = buffer.getChannelData(channel);
		for (let index = 0; index < samples.length; index += 1) {
			samples[index] = Math.sin(index * Math.PI * 440 / sampleRate) * 0.35;
		}
	}
	const project = createMultitrackProject({
		title: 'Real Browser Audio Proof',
		tracks: [
			{
				name: 'Audible',
				gain: 0.8,
				pan: 0.2,
				clips: [{
					name: 'trimmed-real-audio',
					bufferId: 'real',
					timelineStart: 0.1,
					sourceOffset: 0.25,
					duration: 0.5
				}]
			},
			{
				name: 'Muted',
				muted: true,
				clips: [{
					bufferId: 'real',
					duration: 0.6,
					gain: 2
				}]
			}
		]
	});
	const rendered = await renderMultitrackProjectMix(project, {
		audioStore: { getBuffer: () => buffer },
		sampleRate
	});
	const bytes = encodeMultitrackWav(rendered);
	const decoded = await decodeAndValidateMultitrackWav(bytes, 0.6);
	const early = rendered.getChannelData(0).slice(0, Math.floor(sampleRate * 0.08));
	const active = rendered.getChannelData(0).slice(Math.floor(sampleRate * 0.2), Math.floor(sampleRate * 0.4));
	const silentPeak = Math.max(...early);
	const activePeak = Math.max(...active);
	await context.close();
	if (Math.abs(silentPeak) > 0.0001 || activePeak < 0.05 || decoded.peak < 0.05) {
		throw new Error(`Actual WAV audio failed sample inspection: quiet=${silentPeak}, active=${activePeak}`);
	}
	return {
		passed: true,
		duration: decoded.duration,
		channels: decoded.channels,
		frames: decoded.frames,
		peak: decoded.peak,
		quietPeak: silentPeak,
		activePeak,
		wavBytes: bytes.byteLength,
		userAgent: navigator.userAgent
	};
}
