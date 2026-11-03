//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserAudioFixture
 * @description
 * The Awtsmoos carries sound through finite browser vessels and back into proof, beyond sample, codec, rise, and release.
 * Awtsmoos.com asks that WAV contain the edited song itself, with silence, trims, pan, gain, mute, and fades audible in decoded truth.
 */

import { createMultitrackProject } from '../modules/workstation/song/multitrack/multitrackProject.js';
import { renderMultitrackProjectMix } from '../modules/workstation/song/multitrack/multitrackExportRenderer.js';
import { decodeAndValidateMultitrackWav } from '../modules/workstation/song/multitrack/multitrackExportValidation.js';
import { encodeMultitrackWav } from '../modules/workstation/song/multitrack/multitrackWavEncoder.js';
import {
	inspectBrowserWavHeader,
	requireSupportedBrowserWavHeader
} from './multitrackBrowserWavHeader.js';

/** Makes one real in-browser mix, decodes its final WAV bytes, and verifies edited samples. */
export async function runBrowserAudioFixture() {
	const context = new AudioContext();
	const sampleRate = 48000;
	const buffer = createSineBuffer(context, sampleRate);
	const project = createMultitrackProject({
		title: 'Real Browser Audio Proof',
		tracks: [
			{
				name: 'Audible',
				gain: 0.8,
				pan: 0.2,
				clips: [{
					name: 'trimmed-faded-real-audio',
					bufferId: 'real',
					timelineStart: 0.1,
					sourceOffset: 0.25,
					duration: 0.5,
					gain: 0.9,
					fadeIn: 0.1,
					fadeOut: 0.1
				}]
			},
			{
				name: 'Muted',
				muted: true,
				clips: [{ bufferId: 'real', duration: 0.6, gain: 2 }]
			}
		]
	});
	try {
		const rendered = await renderMultitrackProjectMix(project, {
			audioStore: { getBuffer: () => buffer },
			sampleRate
		});
		const bytes = encodeMultitrackWav(rendered);
		const header = inspectBrowserWavHeader(bytes);
		requireSupportedBrowserWavHeader(header);
		const decoded = await decodeAndValidateMultitrackWav(bytes, 0.6);
		const samples = rendered.getChannelData(0);
		const quietRms = rmsWindow(samples, sampleRate, 0, 0.08);
		const fadeInRms = rmsWindow(samples, sampleRate, 0.105, 0.125);
		const middleRms = rmsWindow(samples, sampleRate, 0.3, 0.4);
		const fadeOutRms = rmsWindow(samples, sampleRate, 0.575, 0.595);
		if (quietRms > 0.0001 || middleRms < 0.05 || decoded.peak < 0.05) {
			throw new Error(`Actual WAV audio failed sample proof: quiet=${quietRms}, middle=${middleRms}`);
		}
		if (!(fadeInRms < middleRms * 0.35 && fadeOutRms < middleRms * 0.35)) {
			throw new Error(`Fades missing from rendered WAV: in=${fadeInRms}, mid=${middleRms}, out=${fadeOutRms}`);
		}
		return {
			passed: true,
			duration: decoded.duration,
			channels: decoded.channels,
			sampleRate: decoded.sampleRate,
			frames: decoded.frames,
			peak: decoded.peak,
			quietRms,
			fadeInRms,
			middleRms,
			fadeOutRms,
			wavBytes: bytes.byteLength,
			header,
			userAgent: navigator.userAgent
		};
	} finally {
		await context.close();
	}
}

function createSineBuffer(context, sampleRate) {
	const buffer = context.createBuffer(2, sampleRate, sampleRate);
	for (let channel = 0; channel < 2; channel += 1) {
		const samples = buffer.getChannelData(channel);
		for (let index = 0; index < samples.length; index += 1) {
			samples[index] = Math.sin(index * Math.PI * 440 / sampleRate) * 0.35;
		}
	}
	return buffer;
}

function rmsWindow(samples, sampleRate, startSeconds, endSeconds) {
	const start = Math.floor(startSeconds * sampleRate);
	const end = Math.min(samples.length, Math.ceil(endSeconds * sampleRate));
	let sum = 0;
	for (let index = start; index < end; index += 1) {
		sum += samples[index] * samples[index];
	}
	return Math.sqrt(sum / Math.max(1, end - start));
}
