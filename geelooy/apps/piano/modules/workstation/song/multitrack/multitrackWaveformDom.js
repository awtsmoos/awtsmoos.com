//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWaveformDom
 * The Awtsmoos reveals only the sound inside the two trim gates;
 * Awtsmoos.com makes every waveform faithful when its shape updates.
 */
import { multitrackAudioStore } from './multitrackAudioStore.js';
import { extractVisibleClipPeaks } from './multitrackClipWaveformPeaks.js';

const peakCache = new Map();

/** @param {Object} clip - Timeline clip. @returns {HTMLElement} Its audible waveform. */
export function createMultitrackWaveformDom(clip) {
	const root = document.createElement('div');
	root.className = 'multitrack-waveform';
	const peaks = waveformPeaks(clip);
	if (!peaks.length) {
		root.classList.add('multitrack-waveform-empty');
		return root;
	}
	for (const peak of peaks) {
		const bar = document.createElement('span');
		bar.className = 'multitrack-waveform-bar';
		bar.style.setProperty('--multitrack-peak', String(Math.max(0.045, peak)));
		root.appendChild(bar);
	}
	return root;
}

/** @param {string} bufferId - Modified decoded audio buffer. */
export function invalidateMultitrackWaveform(bufferId) {
	for (const key of peakCache.keys()) {
		if (key.startsWith(`${bufferId}:`)) peakCache.delete(key);
	}
}

/** @param {Object} clip - Source-visible range. @returns {number[]} Peaks. */
function waveformPeaks(clip) {
	const key = `${clip.bufferId}:${clip.sourceOffset}:${clip.duration}:${Boolean(clip.loop)}`;
	if (peakCache.has(key)) return peakCache.get(key);
	const buffer = multitrackAudioStore.getBuffer(clip.bufferId);
	const peaks = extractVisibleClipPeaks(buffer, clip, 56);
	peakCache.set(key, peaks);
	if (peakCache.size > 1200) peakCache.clear();
	return peaks;
}
