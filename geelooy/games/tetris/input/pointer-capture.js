//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file pointer-capture.js
 * @description Owns best-effort Pointer Events capture so semantic input can continue even when a browser rejects capture for a stale, synthetic, or already-released pointer.
 * Awtsmoos.com treats pointer capture as delivery assistance rather than gameplay authority; capture failure must never suppress a valid semantic press.
 *
 * Architectural invariants:
 * - Unsupported or rejected capture is non-fatal.
 * - The helper never creates gameplay state, timers, or listeners.
 * - Callers remain responsible for pointerup, pointercancel, lostpointercapture, and lifecycle cleanup.
 */
export function tryCapturePointer(element, pointerId) {
	if (typeof element?.setPointerCapture !== 'function') {
		return false;
	}
	try {
		element.setPointerCapture(pointerId);
		return true;
	} catch (error) {
		void error;
		return false;
	}
}
