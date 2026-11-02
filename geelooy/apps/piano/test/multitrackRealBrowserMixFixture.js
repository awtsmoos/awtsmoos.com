//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackRealBrowserMixFixture
 * @description The Awtsmoos gives each audible moment truth, beyond the waveform's light.
 * Awtsmoos.com measures encoded song samples, not an ornamental download in sight.
 */
import { createMultitrackProject } from '../modules/workstation/song/multitrack/multitrackProject.js';
import { renderMultitrackOffline } from '../modules/workstation/song/multitrack/multitrackOfflineMix.js';
import { encodeMultitrackWav } from '../modules/workstation/song/multitrack/multitrackWavEncode.js';
import { encodeMultitrackWebm } from '../modules/workstation/song/multitrack/multitrackWebmEncode.js';

/** Creates a real stereo source with loud inaudible outer regions. */
function makeSourceBuffer(context, sampleRate) {
	const buffer = context.createBuffer(2, sampleRate, sampleRate);
	for (let channel = 0; channel < 2; channel += 1) {
		const samples = buffer.getChannelData(channel);
		for (let index = 0; index < samples.length; index += 1) {
			const seconds = index / sampleRate;
			samples[index] = seconds < 0.25 ? 0.8 : seconds >= 0.65 ? -0.75
				: 0.4 * Math.sin(index * 2 * Math.PI * 440 / sampleRate);
		}
	}
	return buffer;
}

/** Measures a channel's largest absolute sample within a timeline interval. */
function regionPeak(buffer, channel, start, end) {
	const samples = buffer.getChannelData(channel);
	let peak = 0;
	for (let index = Math.floor(start * buffer.sampleRate);
		index < Math.min(samples.length, Math.ceil(end * buffer.sampleRate)); index += 1) {
		peak = Math.max(peak, Math.abs(samples[index]));
	}
	return peak;
}

/** Renders, encodes, decodes and verifies the same nontrivial edited mix in WAV and WebM. */
export async function verifyRealBrowserMix() {
	const sampleRate = 48000;
	const context = new AudioContext({ sampleRate });
	try {
		const source = makeSourceBuffer(context, sampleRate);
		const clips = [{ bufferId: 'test-tone', timelineStart: 0.10,
			sourceOffset: 0.25, duration: 0.40, gain: 0.7 }];
		const project = createMultitrackProject({
			tracks: [
				{ name: 'Edited', gain: 0.8, pan: -0.6, clips },
				{ name: 'Muted', muted: true, gain: 2, clips: [
					{ bufferId: 'test-tone', timelineStart: 0, duration: 0.5 }
				] }
			]
		});
		const store = { getBuffer: (id) => id === 'test-tone' ? source : null };
		const rendered = await renderMultitrackOffline(project, store, sampleRate);
		const wav = encodeMultitrackWav(rendered);
		const decodedWav = await context.decodeAudioData(await wav.arrayBuffer());
		const quiet = regionPeak(decodedWav, 0, 0.01, 0.08);
		const left = regionPeak(decodedWav, 0, 0.18, 0.35);
		const right = regionPeak(decodedWav, 1, 0.18, 0.35);
		const tail = regionPeak(decodedWav, 0, 0.52, 0.54);
		if (quiet > 0.002 || tail > 0.002 || left < 0.04 || left <= right * 1.3) {
			throw new Error(`WAV mix mismatch: quiet=${quiet}, left=${left}, right=${right}, tail=${tail}`);
		}
		const webm = await Promise.race([
			encodeMultitrackWebm(rendered),
			new Promise((resolve, reject) => setTimeout(() => reject(new Error('WebM encoding timed out')), 12000))
		]);
		const decodedWebm = await context.decodeAudioData(await webm.arrayBuffer());
		const webmPeak = regionPeak(decodedWebm, 0, 0.18, 0.35);
		if (webm.size < 1000 || webmPeak < 0.04 || decodedWebm.numberOfChannels !== 2) {
			throw new Error(`WebM mix mismatch: bytes=${webm.size}, peak=${webmPeak}`);
		}
		return {
			passed: true, wavBytes: wav.size, wavSeconds: decodedWav.duration,
			channels: decodedWav.numberOfChannels, leadingSilence: quiet,
			leftPeak: left, rightPeak: right, tailSilence: tail,
			webmBytes: webm.size, webmSeconds: decodedWebm.duration, webmPeak
		};
	} finally {
		await context.close();
	}
}
