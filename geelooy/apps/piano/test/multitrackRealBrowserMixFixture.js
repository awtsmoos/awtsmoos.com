//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackRealBrowserMixFixture
 * @description The Awtsmoos gives each audible moment truth, beyond waveform, cut, and encoded light.
 * Awtsmoos.com measures the real edited WAV and WebM, proving trim, fade, pan, mute, and split in the browser's hearing sight.
 */
import { splitMultitrackClip } from '../modules/workstation/song/multitrack/multitrackClipMath.js';
import { createMultitrackClip, createMultitrackProject } from '../modules/workstation/song/multitrack/multitrackProject.js';
import { renderMultitrackOffline } from '../modules/workstation/song/multitrack/multitrackOfflineMix.js';
import { encodeMultitrackWav } from '../modules/workstation/song/multitrack/multitrackWavEncode.js';
import { encodeMultitrackWebm } from '../modules/workstation/song/multitrack/multitrackWebmEncode.js';

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

function regionPeak(buffer, channel, start, end) {
	const samples = buffer.getChannelData(channel);
	let peak = 0;
	for (let index = Math.floor(start * buffer.sampleRate);
		index < Math.min(samples.length, Math.ceil(end * buffer.sampleRate)); index += 1) {
		peak = Math.max(peak, Math.abs(samples[index]));
	}
	return peak;
}

function maximumDifference(first, second) {
	let maximum = 0;
	for (let channel = 0; channel < first.numberOfChannels; channel += 1) {
		const a = first.getChannelData(channel);
		const b = second.getChannelData(channel);
		for (let index = 0; index < a.length; index += 1) {
			maximum = Math.max(maximum, Math.abs(a[index] - b[index]));
		}
	}
	return maximum;
}

function inspectWavHeader(bytes) {
	const view = new DataView(bytes);
	const ascii = (offset, length) => Array.from({ length }, (_, index) =>
		String.fromCharCode(view.getUint8(offset + index))).join('');
	return {
		riff: ascii(0, 4), wave: ascii(8, 4), audioFormat: view.getUint16(20, true),
		channels: view.getUint16(22, true), sampleRate: view.getUint32(24, true),
		bitsPerSample: view.getUint16(34, true), dataBytes: view.getUint32(40, true)
	};
}

/** Renders, encodes, decodes and verifies one nontrivial edited mix in WAV and WebM. */
export async function verifyRealBrowserMix() {
	const sampleRate = 48000;
	const context = new AudioContext({ sampleRate });
	try {
		const source = makeSourceBuffer(context, sampleRate);
		const clip = createMultitrackClip({
			bufferId: 'test-tone', timelineStart: 0.10, sourceOffset: 0.25,
			duration: 0.40, gain: 0.7, fadeIn: 0.08, fadeOut: 0.08
		});
		const project = createMultitrackProject({ tracks: [
			{ name: 'Edited', gain: 0.8, pan: -0.6, clips: [clip] },
			{ name: 'Muted', muted: true, gain: 2, clips: [{ bufferId: 'test-tone', duration: 0.5 }] }
		] });
		const store = { getBuffer: (id) => id === 'test-tone' ? source : null };
		const rendered = await renderMultitrackOffline(project, store, sampleRate);
		const [leftClip, rightClip] = splitMultitrackClip(clip, 0.30);
		const splitProject = createMultitrackProject({ tracks: [
			{ name: 'Edited', gain: 0.8, pan: -0.6, clips: [leftClip, rightClip] }
		] });
		const splitRendered = await renderMultitrackOffline(splitProject, store, sampleRate);
		const splitDifference = maximumDifference(rendered, splitRendered);
		const wav = encodeMultitrackWav(rendered);
		const wavBytes = await wav.arrayBuffer();
		const header = inspectWavHeader(wavBytes);
		const decodedWav = await context.decodeAudioData(wavBytes.slice(0));
		const quiet = regionPeak(decodedWav, 0, 0.01, 0.08);
		const fadeIn = regionPeak(decodedWav, 0, 0.105, 0.12);
		const middle = regionPeak(decodedWav, 0, 0.25, 0.35);
		const fadeOut = regionPeak(decodedWav, 0, 0.48, 0.495);
		const right = regionPeak(decodedWav, 1, 0.25, 0.35);
		const tail = regionPeak(decodedWav, 0, 0.52, 0.54);
		if (header.riff !== 'RIFF' || header.wave !== 'WAVE' || header.audioFormat !== 1
			|| header.bitsPerSample !== 16 || header.channels !== 2 || header.sampleRate !== sampleRate) {
			throw new Error(`WAV header mismatch: ${JSON.stringify(header)}`);
		}
		if (quiet > 0.002 || tail > 0.002 || middle < 0.04 || middle <= right * 1.3
			|| fadeIn >= middle * 0.5 || fadeOut >= middle * 0.5 || splitDifference > 0.00001) {
			throw new Error(`Mix mismatch: ${JSON.stringify({ quiet, fadeIn, middle, fadeOut, right, tail, splitDifference })}`);
		}
		const webm = await Promise.race([
			encodeMultitrackWebm(rendered),
			new Promise((_, reject) => setTimeout(() => reject(new Error('WebM encoding timed out')), 12000))
		]);
		const decodedWebm = await context.decodeAudioData(await webm.arrayBuffer());
		const webmPeak = regionPeak(decodedWebm, 0, 0.25, 0.35);
		if (webm.size < 1000 || webmPeak < 0.04 || decodedWebm.numberOfChannels !== 2) {
			throw new Error(`WebM mix mismatch: bytes=${webm.size}, peak=${webmPeak}`);
		}
		return { passed: true, header, wavBytes: wav.size, wavSeconds: decodedWav.duration,
			channels: decodedWav.numberOfChannels, peak: middle, quiet, fadeIn, fadeOut, tail,
			rightPeak: right, splitDifference, webmBytes: webm.size, webmSeconds: decodedWebm.duration, webmPeak };
	} finally {
		await context.close();
	}
}
