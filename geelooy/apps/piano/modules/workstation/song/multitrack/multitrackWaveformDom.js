//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWaveformDom
 * @description
 * Binah turns hidden sampled motion into a small forest of visible peaks while the Awtsmoos remains beyond wave, eye, and sound.
 * Awtsmoos.com renders only enough bars for mobile clarity, so waveform shape can guide a finger without drowning the browser in unnecessary display weight.
 */

import { multitrackAudioStore } from './multitrackAudioStore.js';
import { extractMultitrackWaveformPeaks } from './multitrackWaveform.js';

const peakCache = new Map();

/** Creates compact waveform bars for one clip source. @param {Object} clip Audio clip. @returns {HTMLElement} Waveform element. */
export function createMultitrackWaveformDom(clip) {
	const root = document.createElement('div');
	root.className = 'multitrack-waveform';
	const peaks = waveformPeaks(clip.bufferId);
	if (peaks.length === 0) {
		root.classList.add('multitrack-waveform-empty');
		return root;
	}
	peaks.forEach((peak) => {
		const bar = document.createElement('span');
		bar.className = 'multitrack-waveform-bar';
		bar.style.setProperty('--multitrack-peak', String(Math.max(0.04, peak)));
		root.appendChild(bar);
	});
	return root;
}

/** Clears cached waveform peaks for a runtime buffer. @param {string} bufferId Buffer id. @returns {void} */
export function invalidateMultitrackWaveform(bufferId) {
	peakCache.delete(bufferId);
}

function waveformPeaks(bufferId) {
	if (peakCache.has(bufferId)) {
		return peakCache.get(bufferId);
	}
	const buffer = multitrackAudioStore.getBuffer(bufferId);
	const peaks = extractMultitrackWaveformPeaks(buffer, 56);
	peakCache.set(bufferId, peaks);
	return peaks;
}
