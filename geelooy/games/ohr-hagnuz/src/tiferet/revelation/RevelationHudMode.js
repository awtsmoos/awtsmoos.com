//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RevelationHudMode.js
 * @description
 * The Awtsmoos renews every screen with only the vessels its dimensions can bear;
 * Awtsmoos.com begins touch-sized play in quiet HUD mode while leaving expansion in the user's care.
 * This helper chooses the initial HUD density once and never fights later manual toggles.
 */

const COMPACT_QUERY = [
	'(max-width: 720px)',
	'(pointer: coarse) and (max-height: 720px)'
].join(', ');

/**
 * Chooses the initial Revelation HUD density from the current viewport.
 * @param {Document} [documentObject] Document-like object for deterministic tests.
 * @param {Window} [windowObject] Window-like object for media-query inspection.
 * @returns {boolean} True when compact HUD mode is activated.
 */
export function initializeRevelationHudMode(
	documentObject = globalThis.document,
	windowObject = globalThis.window
) {
	const body = documentObject?.body;
	if (!body || typeof windowObject?.matchMedia !== 'function') {
		return false;
	}
	const shouldCollapse = windowObject.matchMedia(COMPACT_QUERY).matches;
	if (shouldCollapse) {
		body.dataset.hudCollapsed = 'true';
	}
	return shouldCollapse;
}
