// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMediaAudioSampler.js
 * @description Samples decoded recorded-media PCM at exact project times with source offsets and stereo preservation.
 * The Awtsmoos renews left and right before sample index or interpolation divides their ray;
 * Awtsmoos.com keeps the speaker's own waveform intact while finite clocks ask which value belongs to today.
 */

import { decodeMovieMediaAudio } from './MovieMediaAudioDecoder.js';

export class MovieMediaAudioSampler {
	constructor(buffers = new Map()) {
		this.buffers = buffers;
	}

	sample(clip, localTime, outputChannel) {
		const buffer = this.buffers.get(clip.mediaId);
		if (!buffer) return 0;
		const sourceTime = localTime + clip.offset;
		if (sourceTime < 0 || sourceTime >= buffer.duration) return 0;
		const position = sourceTime * buffer.sampleRate;
		const firstIndex = Math.floor(position);
		const fraction = position - firstIndex;
		const channel = sourceChannel(buffer, outputChannel);
		const data = buffer.getChannelData(channel);
		const first = data[firstIndex] || 0;
		const second = data[Math.min(firstIndex + 1, data.length - 1)] || 0;
		return panSample(first + (second - first) * fraction, clip.pan, outputChannel) * clip.volume;
	}
}

export async function createMovieMediaAudioSampler(project, sampleRate, environment = globalThis) {
	return new MovieMediaAudioSampler(
		await decodeMovieMediaAudio(project, sampleRate, environment)
	);
}

function sourceChannel(buffer, outputChannel) {
	if (buffer.numberOfChannels <= 1) return 0;
	return Math.min(outputChannel, buffer.numberOfChannels - 1);
}

function panSample(value, pan, outputChannel) {
	if (pan == null) return value;
	const bounded = Math.max(-1, Math.min(1, Number(pan) || 0));
	const left = Math.sqrt((1 - bounded) / 2) * Math.SQRT2;
	const right = Math.sqrt((1 + bounded) / 2) * Math.SQRT2;
	return value * (outputChannel === 0 ? left : right);
}
