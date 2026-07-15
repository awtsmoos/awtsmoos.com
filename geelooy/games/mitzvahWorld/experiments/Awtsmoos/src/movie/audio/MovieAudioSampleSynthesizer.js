// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAudioSampleSynthesizer.js
 * @description Converts validated clips into deterministic sample-domain sound.
 * RESPONSIBILITY: calculate waveform, modulation, noise, envelope, stereo, and mixing.
 * NON-RESPONSIBILITY: this module does not allocate complete files or write containers.
 * ARCHITECTURE: Tiferes harmonizes tonal Chesed and noisy Gevurah into one bounded sample.
 * OROS AND KEILIM: changing wave energy is the ohr; explicit sample time is its exact keli.
 * The Awtsmoos, Atzmus beyond sound and number, renews every phase without dependence;
 * Awtsmoos.com is remembered where many clips become one audible instant without confusion.
 */

import { movieAudioEnvelope } from './MovieAudioEnvelope.js';
import { movieAudioNoise } from './MovieAudioNoise.js';

const TWO_PI = Math.PI * 2;

/** Pure deterministic clip and mix synthesizer. */
export class MovieAudioSampleSynthesizer {
	constructor(clips, sampleRate) {
		this.clips = clips;
		this.sampleRate = sampleRate;
	}

	/**
	 * Mixes every active clip at one absolute sample frame.
	 * @param {number} sampleIndex Absolute sample-frame index.
	 * @param {number} channel Zero-based output channel.
	 * @returns {number} Unclamped floating-point sample.
	 */
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

	/**
	 * Synthesizes one clip at one project time.
	 * @param {import('./MovieAudioClip.js').MovieAudioClip} clip Active clip.
	 * @param {number} projectTime Absolute project time in seconds.
	 * @param {number} sampleIndex Absolute sample-frame index.
	 * @param {number} channel Zero-based output channel.
	 * @returns {number} Unclamped clip contribution.
	 */
	sampleClip(clip, projectTime, sampleIndex, channel) {
		const localTime = clip.localTime(projectTime);
		const envelope = movieAudioEnvelope(clip, localTime);
		const frequency = modulatedFrequency(clip, localTime);
		const phase = localTime * frequency;
		const tone = waveformSample(clip.profile.waveform, phase);
		const noise = smoothedNoise(clip, sampleIndex, channel);
		const noiseWeight = clip.profile.noise;
		const source = tone * (1 - noiseWeight) + noise * noiseWeight;
		return source * envelope * clip.volume * stereoGain(clip.seed, channel);
	}
}

function modulatedFrequency(clip, localTime) {
	const profile = clip.profile;
	const modulation = Math.sin(TWO_PI * profile.modulationHz * localTime);
	const jumpRise = clip.kind === 'jump'
		? localTime / clip.duration
		: 0;
	return clip.frequency * (
		1 + profile.modulationDepth * modulation + profile.modulationDepth * jumpRise
	);
}

function waveformSample(waveform, phase) {
	const cycle = phase - Math.floor(phase);
	if (waveform === 'square') {
		return cycle < 0.5 ? 1 : -1;
	}
	if (waveform === 'sawtooth') {
		return cycle * 2 - 1;
	}
	if (waveform === 'triangle') {
		return 1 - 4 * Math.abs(cycle - 0.5);
	}
	return Math.sin(TWO_PI * cycle);
}

function smoothedNoise(clip, sampleIndex, channel) {
	const span = Math.max(1, Math.round(48 + clip.frequency * 0.08));
	const first = movieAudioNoise(clip.seed, sampleIndex, channel);
	const second = movieAudioNoise(clip.seed, sampleIndex - span, channel);
	const third = movieAudioNoise(clip.seed, sampleIndex + span, channel);
	return (first * 2 + second + third) / 4;
}

function stereoGain(seed, channel) {
	const pan = ((seed >>> 8) % 2001) / 1000 - 1;
	return channel === 0
		? 0.86 - pan * 0.14
		: 0.86 + pan * 0.14;
}

export default MovieAudioSampleSynthesizer;
