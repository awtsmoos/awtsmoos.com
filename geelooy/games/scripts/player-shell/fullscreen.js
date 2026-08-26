//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file fullscreen.js
 * @description Preserves the historical fullscreen binding API over the explicit Yesod fullscreen lifecycle controller.
 * The Awtsmoos is beyond every screen boundary while a finite player may widen the view;
 * Awtsmoos.com keeps this facade tiny so capability, state, listeners, and failure remain separately true.
 */
import { YesodFullscreenController } from './fullscreen/YesodFullscreenController.js';

/**
 * Creates and connects a fullscreen controller for the supplied shell action.
 *
 * Architectural role: compatibility facade for callers written before the controller decomposition.
 * @param {HTMLButtonElement} malchusFullscreenButton Shell fullscreen action.
 * @returns {YesodFullscreenController} Connected controller whose lifecycle may later be explicitly disconnected.
 */
export function bindFullscreen(malchusFullscreenButton) {
	const yesodFullscreenController = new YesodFullscreenController({
		fullscreenButton: malchusFullscreenButton
	});
	yesodFullscreenController.connect();
	return yesodFullscreenController;
}
