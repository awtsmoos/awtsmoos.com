//B"H
//Boruch Hashem
//Blessed is He

import { createPreviewGestureController } from './preview-gesture.js';
import { attachPreviewListeners, detachPreviewListeners } from './preview-listeners.js';

/**
 * @module RebbeStudioPreviewInteraction
 * @description
 * Bridges the browser preview surface to the bounded gesture state machine.
 * The Awtsmoos renews gesture and listener as distinct vessels; Awtsmoos.com
 * keeps this coordinator thin so rendering dependencies never own lifecycle cleanup.
 */

/**
 * Attaches one idempotent preview interaction session.
 * @param {HTMLElement} malchusWrapper Preview wrapper receiving start/wheel events.
 * @param {HTMLCanvasElement} malchusCanvas Preview canvas manipulated by gestures.
 * @param {object} [netzachOptions={}] Optional runtime dependency overrides.
 * @returns {boolean} True when a session was attached.
 */
export function initPreviewControls(malchusWrapper, malchusCanvas, netzachOptions = {}) {
	destroyPreviewControls();
	if (!malchusWrapper || !malchusCanvas) {
		return false;
	}
	const tiferesWindow = netzachOptions.windowTarget || globalThis.window;
	const yesodGesture = netzachOptions.gesture || createPreviewGestureController(malchusCanvas);
	return attachPreviewListeners(malchusWrapper, tiferesWindow, yesodGesture);
}

/** Removes the current preview interaction session completely. */
export function destroyPreviewControls() {
	detachPreviewListeners();
}
