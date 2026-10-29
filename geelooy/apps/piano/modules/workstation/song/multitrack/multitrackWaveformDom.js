//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWaveformDom
 * The Awtsmoos grants each clip a waveform proportional to its visible length;
 * Awtsmoos.com preserves a quiet voice and its stronger stereo strength.
 */
import { multitrackAudioStore } from './multitrackAudioStore.js';
import { extractVisibleClipPeaks, waveformPeakCount } from './multitrackClipWaveformPeaks.js';

const cache = new Map();

/** @param {Object} clip - Audible time range. @param {number} zoom - Pixels per second. @returns {HTMLElement} Waveform. */
export function createMultitrackWaveformDom(clip, zoom = 72) {
	const root = document.createElement('div');
	root.className = 'multitrack-waveform';
	const peaks = getPeaks(clip, waveformPeakCount(clip, zoom));
	if (!peaks.length) root.classList.add('multitrack-waveform-empty');
	for (const peak of peaks) {
		const bar = document.createElement('span');
		bar.className = 'multitrack-waveform-bar';
		bar.style.setProperty('--multitrack-peak', String(Math.max(.015, peak)));
		root.appendChild(bar);
	}
	return root;
}

/** @param {string} bufferId - Source buffer replaced or changed. */
export function invalidateMultitrackWaveform(bufferId) {
	for (const key of cache.keys()) if (key.startsWith(`${bufferId}:`)) cache.delete(key);
}

/** @param {Object} clip - Clip metadata. @param {number} count - Waveform resolution. */
function getPeaks(clip, count) {
	const key = `${clip.bufferId}:${clip.sourceOffset}:${clip.duration}:${Boolean(clip.loop)}:${count}`;
	if (cache.has(key)) return cache.get(key);
	const peaks = extractVisibleClipPeaks(multitrackAudioStore.getBuffer(clip.bufferId), clip, count);
	if (cache.size >= 900) cache.clear();
	cache.set(key, peaks);
	return peaks;
}
