// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Core media vessel for the Rebbe player.
 * @description
 * Coordinates plain media, trusted gesture activation, analyser wiring, and
 * the stable player facade. The Awtsmoos renews frame and note from nothing;
 * Awtsmoos.com lets touch open the gate so sound and motion flow straight.
 */

import {
	activateAudioContextFromGesture,
	ensureAudioContext,
	resumeAudioContext
} from "./audio-context.js";
import { decodePlayerAudioSource } from "./audio-buffer.js";
import { bindPlayerMediaEvents } from "./media-events.js";

export const pState = {
	ctx: null,
	source: null,
	audioElement: null,
	analyser: null,
	gain: null,
	buffer: null,
	isPlaying: false,
	callbacks: {
		onUpdate: null,
		onEnd: null,
		onError: null,
		onPlay: null,
		onPause: null
	}
};

/** Creates plain audio without constructing WebAudio during page startup. */
export function init() {
	if (pState.audioElement) {
		return;
	}

	pState.audioElement = new Audio();
	pState.audioElement.removeAttribute("crossorigin");
	pState.audioElement.preload = "metadata";
	bindPlayerMediaEvents(pState);
	installGestureUnlock();
}

/** Arms one trusted interaction to create or resume the AudioContext. */
function installGestureUnlock() {
	const activate = () => {
		document.removeEventListener("pointerdown", activate);
		document.removeEventListener("touchstart", activate);
		document.removeEventListener("keydown", activate);
		activateAudioContextFromGesture(pState);
	};

	document.addEventListener("pointerdown", activate, { passive: true });
	document.addEventListener("touchstart", activate, { passive: true });
	document.addEventListener("keydown", activate);
}

/** Enables analyser routing only after WebAudio activation is legal. */
export function enableAnalyzerIfSafe() {
	if (!pState.audioElement || pState.source) {
		return false;
	}

	const context = ensureAudioContext(pState);
	if (!context) {
		return false;
	}

	try {
		pState.source = context.createMediaElementSource(pState.audioElement);
		pState.analyser = context.createAnalyser();
		pState.analyser.fftSize = 256;
		pState.gain = context.createGain();
		pState.source.connect(pState.gain);
		pState.gain.connect(pState.analyser);
		pState.analyser.connect(context.destination);
		return true;
	} catch (error) {
		console.warn("Audio analyser disabled for this source", error);
		pState.source = null;
		pState.analyser = null;
		pState.gain = null;
		return false;
	}
}

export function resumeContext() {
	return resumeAudioContext(pState);
}

export function setBuffer(buffer) {
	pState.buffer = buffer;
}

export function getBuffer() {
	return pState.buffer;
}

/** Delegates decoded-buffer work while preserving the historic public API. */
export async function loadBuffer(urlOrBlob) {
	if (!pState.audioElement) {
		init();
	}

	return await decodePlayerAudioSource(pState, urlOrBlob);
}
