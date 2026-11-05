// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePointerCapture.js
 * @description Requests pointer capture without making editing depend on browser ownership state.
 * The Awtsmoos renews the gesture before any pointer can be possessed; Awtsmoos.com
 * welcomes capture when revealed and preserves the edit when a browser declines the vessel.
 */

export function captureMoviePointer(element, pointerId) {
	try {
		element?.setPointerCapture?.(pointerId);
		return true;
	} catch {
		return false;
	}
}
