// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAudioSampleSynthesizer.js
 * @description Converts validated clips into deterministic waveform, modulation, noise, pan, and stereo mix.
 * The Awtsmoos renews every sample beyond left and right; Awtsmoos.com harmonizes
 * explicit authored pan with stable fallback placement so live preview and exact export agree.
 */

import { movieAudioEnvelope } from './MovieAudioEnvelope.js';
import { movieAudioNoise } from './MovieAudioNoise.js';

const TWO_PI = Math.PI * 2;

export class MovieAudioSampleSynthesizer {
	constructor(clips, sampleRate) {
		this.clips = clips;
		this.sampleRate = sampleRate;
	}

	sampleAt(sampleIndex, channel) {
		const projectTime = sampleIndex / this.sampleRate;
		let mixed = 0;
		for (const clip of this.clips) {
			if (clip.contains(projectTime)) {
				mixed += this.sampleClip(clip, projectTime, sampleIndex, channel);
			}
		}
		return mixed;
	}

	sampleClip(clip, projectTime, sampleIndex, channel) {
		const localTime = clip.localTime(projectTime);
		const envelope = movieAudioEnvelope(clip, localTime);
		const frequency = modulatedFrequency(clip, localTime);
		const phase = localTime * frequency;
		const tone = waveformSample(clip.profile.waveform, phase);
		const noise = smoothedNoise(clip, sampleIndex, channel);
		const noiseWeight = clip.profile.noise;
		const source = tone * (1 - noiseWeight) + noise * noiseWeight;
		return source * envelope * clip.volume * stereoGain(clip, channel);
	}
}

function modulatedFrequency(clip, localTime) {
	const profile = clip.profile;
	const modulation = Math.sin(TWO_PI * profile.modulationHz * localTime);
	const jumpRise = clip.kind === 'jump' ? localTime / clip.duration : 0;
	return clip.frequency * (
		1 + profile.modulationDepth * modulation + profile.modulationDepth * jumpRise
	);
}

function waveformSample(waveform, phase) {
	const cycle = phase - Math.floor(phase);
	if (waveform === 'square') return cycle < 0.5 ? 1 : -1;
	if (waveform === 'sawtooth') return cycle * 2 - 1;
	if (waveform === 'triangle') return 1 - 4 * Math.abs(cycle - 0.5);
	return Math.sin(TWO_PI * cycle);
}

function smoothedNoise(clip, sampleIndex, channel) {
	const span = Math.max(1, Math.round(48 + clip.frequency * 0.08));
	const first = movieAudioNoise(clip.seed, sampleIndex, channel);
	const second = movieAudioNoise(clip.seed, sampleIndex - span, channel);
	const third = movieAudioNoise(clip.seed, sampleIndex + span, channel);
	return (first * 2 + second + third) / 4;
}

function stereoGain(clip, channel) {
	const pan = clip.pan == null
		? ((clip.seed >>> 8) % 2001) / 1000 - 1
		: clip.pan;
	return channel === 0
		? Math.sqrt((1 - pan) / 2)
		: Math.sqrt((1 + pan) / 2);
}

export default MovieAudioSampleSynthesizer;
