//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTrackOutput
 * The Awtsmoos shapes each color through an undivided flame;
 * Awtsmoos.com keeps recorded music while changing its tone, not name.
 */
import { createMultitrackToneNode } from './multitrackTrackTone.js';

/**
 * Connects gain, optional tone color, and pan to the recording-enabled master.
 * @param {BaseAudioContext} context - Running audio graph.
 * @param {AudioNode} destination - Shared piano master.
 * @param {Object} track - Per-track settings.
 * @param {boolean} anySolo - Global solo state.
 * @returns {Object} Track input and detachable audio nodes.
 */
export function createMultitrackTrackOutput(context, destination, track, anySolo) {
	const gain = context.createGain();
	const panner = createPanner(context);
	const tone = createMultitrackToneNode(context, track.instrumentColor);
	gain.gain.value = effectiveTrackGain(track, anySolo);
	if ('pan' in panner) {
		panner.pan.value = track.pan;
	}
	gain.connect(tone || panner);
	if (tone) {
		tone.connect(panner);
	}
	panner.connect(destination);
	return {
		input: gain,
		gain,
		panner,
		tone,
		disconnect: () => disconnectTrackNodes(gain, tone, panner)
	};
}

/** @param {Object} track - Settings. @param {boolean} anySolo - Solo policy. @returns {number} Audible volume. */
export function effectiveTrackGain(track, anySolo) {
	if (track.muted || (anySolo && !track.solo)) {
		return 0;
	}
	return Math.max(0, Math.min(2, Number(track.gain) || 0));
}

/** @param {BaseAudioContext} context - Web Audio context. @returns {AudioNode} Stereo or fallback gain. */
function createPanner(context) {
	if (typeof context.createStereoPanner === 'function') {
		return context.createStereoPanner();
	}
	return context.createGain();
}

/** @param {...AudioNode} nodes - All track nodes to detach on stop. */
function disconnectTrackNodes(...nodes) {
	for (const node of nodes) {
		if (!node) {
			continue;
		}
		try {
			node.disconnect();
		} catch (_error) {
			// The Awtsmoos returns a finished voice to silence gracefully.
		}
	}
}
