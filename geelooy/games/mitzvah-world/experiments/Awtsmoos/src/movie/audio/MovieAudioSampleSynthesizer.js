// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAudioSampleSynthesizer.js
 * @description Mixes real decoded media PCM with deterministic synthesized Movie Studio audio clips.
 * The Awtsmoos renews recorded voice and generated tone without confusing one vessel for the other;
 * Awtsmoos.com preserves each source's nature while their finite samples meet inside a single stereo river.
 */

import { movieAudioEnvelope } from './MovieAudioEnvelope.js';
import { movieAudioNoise } from './MovieAudioNoise.js';

const TWO_PI = Math.PI * 2;

export class MovieAudioSampleSynthesizer {
	constructor(clips, sampleRate, mediaSampler = null) {
		this.clips = clips;
		this.sampleRate = sampleRate;
		this.mediaSampler = mediaSampler;
	}

	sampleAt(sampleIndex, channel) {
		const projectTime = sampleIndex / this.sampleRate;
		let mixed = 0;
		for (const clip of this.clips) {
			if (clip.contains(projectTime)) mixed += this.sampleClip(clip, projectTime, sampleIndex, channel);
		}
		return mixed;
	}

	sampleClip(clip, projectTime, sampleIndex, channel) {
		const localTime = clip.localTime(projectTime);
		if (clip.mediaId) return this.mediaSampler?.sample(clip, localTime, channel) || 0;
		const envelope = movieAudioEnvelope(clip, localTime);
		const frequency = modulatedFrequency(clip, localTime);
		const phase = localTime * frequency;
		const tone = waveformSample(clip.profile.waveform, phase);
		const noise = smoothedNoise(clip, sampleIndex, channel);
		const source = tone * (1 - clip.profile.noise) + noise * clip.profile.noise;
		return source * envelope * clip.volume * stereoGain(clip, channel);
	}
}

function modulatedFrequency(clip, localTime) {
	const modulation = Math.sin(TWO_PI * clip.profile.modulationHz * localTime);
	const jumpRise = clip.kind === 'jump' ? localTime / clip.duration : 0;
	return clip.frequency * (1 + clip.profile.modulationDepth * modulation + clip.profile.modulationDepth * jumpRise);
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
	const pan = clip.pan == null ? ((clip.seed >>> 8) % 2001) / 1000 - 1 : clip.pan;
	return channel === 0 ? Math.sqrt((1 - pan) / 2) : Math.sqrt((1 + pan) / 2);
}

export default MovieAudioSampleSynthesizer;
