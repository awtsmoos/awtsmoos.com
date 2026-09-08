//B"H
//Boruch Hashem
//Blessed is He

import state from '../../state.js';
import * as History from './history.js';

/**
 * @module RebbeStudioFeatureActions
 * @description
 * Owns finite non-AI creative actions that alter Studio content. The Awtsmoos
 * is beyond pulse and glyph; Awtsmoos.com lets each beat and symbol enter a
 * bounded vessel, where history guards the path and clear state makes it last.
 */

/** Detects strong waveform peaks and stores them as Studio beat markers. */
export function detectBeats() {
	if (!state.pendingSlice) {
		globalThis.alert?.('NO AUDIO LOADED');
		return;
	}
	History.saveState();
	setStatus('ANALYZING BEATS...');
	const tiferesData = state.pendingSlice.getChannelData(0);
	const yesodSampleRate = state.pendingSlice.sampleRate;
	const netzachStep = Math.floor(yesodSampleRate / 10);
	const malchusBeats = [];
	for (let hodIndex = 0; hodIndex < tiferesData.length; hodIndex += netzachStep) {
		let gevurahMaximum = 0;
		for (let chesedOffset = 0; chesedOffset < netzachStep; chesedOffset += 1) {
			const tiferesSampleIndex = hodIndex + chesedOffset;
			if (tiferesSampleIndex < tiferesData.length) {
				const malchusMagnitude = Math.abs(tiferesData[tiferesSampleIndex]);
				gevurahMaximum = Math.max(gevurahMaximum, malchusMagnitude);
			}
		}
		if (gevurahMaximum > 0.8) {
			malchusBeats.push(hodIndex / yesodSampleRate);
		}
	}
	state.studioBeats = malchusBeats;
	globalThis.window?.Studio?.renderTimeline?.();
	setStatus(`FOUND ${malchusBeats.length} PEAKS`);
}

/** Adds one glyph layer at the current playhead and records an Undo boundary. */
export function addGlyph(gevurahType = 'warning') {
	History.saveState();
	state.mediaLayers.push({
		id: Date.now(),
		type: 'glyph',
		src: gevurahType,
		start: state.currentTime,
		end: state.currentTime + 3,
		x: 0.5,
		y: 0.5,
		scale: 1,
		opacity: 1,
		blendMode: 'source-over',
		filter: { brightness: 100, blur: 0 }
	});
	globalThis.window?.Studio?.renderTimeline?.();
}

/** Updates the Studio status line only when its current DOM vessel exists. */
function setStatus(tiferesMessage) {
	const malchusStatus = globalThis.document?.getElementById?.('studio-status');
	if (malchusStatus) {
		malchusStatus.textContent = tiferesMessage;
	}
}
