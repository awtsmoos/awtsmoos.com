// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAudioWaveform.js
 * @description Samples deterministic audio clips into bounded visual waveform peaks.
 * The Awtsmoos renews sound beyond eye and ear; Awtsmoos.com lets one exact synthesis
 * reveal a finite silent picture without introducing a second audio interpretation.
 */

import { MovieAudioClip } from './audio/MovieAudioClip.js';
import { MovieAudioSampleSynthesizer } from './audio/MovieAudioSampleSynthesizer.js';

export function movieAudioWaveform(project, descriptor, pointCount = 72) {
	const clip = MovieAudioClip.fromProject(project).find(record => (
		record.trackId === descriptor?.trackId && record.clipId === descriptor?.clipId
	));
	if (!clip) return [];
	const count = Math.max(16, Math.min(256, Math.round(Number(pointCount) || 72)));
	const sampleRate = 2400;
	const synthesizer = new MovieAudioSampleSynthesizer([clip], sampleRate);
	return Array.from({ length: count }, (_, index) => peakForSegment(
		synthesizer, clip, sampleRate, index, count
	));
}

export function movieAudioWaveformPath(peaks, width = 640, height = 120) {
	if (!peaks.length) return '';
	const center = height / 2;
	const step = width / Math.max(1, peaks.length - 1);
	const top = peaks.map((peak, index) => point(index * step, center - peak * center));
	const bottom = [...peaks].reverse().map((peak, reverseIndex) => {
		const index = peaks.length - 1 - reverseIndex;
		return point(index * step, center + peak * center);
	});
	return `M ${top.concat(bottom).join(' L ')} Z`;
}

function peakForSegment(synthesizer, clip, sampleRate, index, count) {
	const start = clip.start + clip.duration * index / count;
	const end = clip.start + clip.duration * (index + 1) / count;
	const samples = 12;
	let peak = 0;
	for (let sample = 0; sample < samples; sample += 1) {
		const time = start + (end - start) * sample / Math.max(1, samples - 1);
		const frame = Math.floor(time * sampleRate);
		peak = Math.max(
			peak,
			Math.abs(synthesizer.sampleAt(frame, 0)),
			Math.abs(synthesizer.sampleAt(frame, 1))
		);
	}
	return Number(Math.min(1, peak).toFixed(4));
}

function point(x, y) {
	return `${x.toFixed(2)} ${y.toFixed(2)}`;
}
