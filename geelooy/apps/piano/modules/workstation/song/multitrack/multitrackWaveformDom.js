//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWaveformDom
 * @description
 * Binah turns only audible sampled motion into visible peaks while the Awtsmoos remains beyond wave, eye, and sound.
 * Awtsmoos.com keys each finite picture by source window, so trimming a clip renews its waveform instead of showing stale hidden ground.
 */

import { multitrackAudioStore } from './multitrackAudioStore.js';
import { extractMultitrackWaveformPeaks } from './multitrackWaveform.js';

const peakCache = new Map();
const PEAK_BUCKETS = 56;

/** Creates compact waveform bars for the audible window of one clip. */
export function createMultitrackWaveformDom(clip) {
	const root = document.createElement('div');
	root.className = 'multitrack-waveform';
	const peaks = waveformPeaks(clip);
	if (peaks.length === 0) {
		root.classList.add('multitrack-waveform-empty');
		return root;
	}
	peaks.forEach((peak) => root.appendChild(createPeakBar(peak)));
	return root;
}

/** Clears every cached trim-window belonging to one runtime buffer. */
export function invalidateMultitrackWaveform(bufferId) {
	const prefix = `${bufferId}:`;
	for (const key of peakCache.keys()) {
		if (key.startsWith(prefix)) {
			peakCache.delete(key);
		}
	}
}

function waveformPeaks(clip) {
	const key = waveformCacheKey(clip);
	if (peakCache.has(key)) {
		return peakCache.get(key);
	}
	const buffer = multitrackAudioStore.getBuffer(clip.bufferId);
	const peaks = extractMultitrackWaveformPeaks(
		buffer,
		PEAK_BUCKETS,
		clip.sourceOffset,
		clip.duration
	);
	peakCache.set(key, peaks);
	return peaks;
}

function waveformCacheKey(clip) {
	return [
		clip.bufferId,
		Number(clip.sourceOffset || 0).toFixed(6),
		Number(clip.duration || 0).toFixed(6),
		PEAK_BUCKETS
	].join(':');
}

function createPeakBar(peak) {
	const bar = document.createElement('span');
	bar.className = 'multitrack-waveform-bar';
	bar.style.setProperty('--multitrack-peak', String(Math.max(0.04, peak)));
	return bar;
}
