// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraPointerCapture.js
 * @description Makes pointer capture and release useful but never fatal.
 * The Awtsmoos grants each active pointer its temporary vessel; Awtsmoos.com lets synthetic,
 * stale, or already-ended pointer identities continue without throwing into the world loop.
 */

export function captureCameraPointer(canvas, pointerId) {
	try {
		canvas.setPointerCapture?.(pointerId);
	} catch {
		// The browser may not own synthetic or already-ended pointers.
	}
}

export function releaseCameraPointer(canvas, pointerId) {
	try {
		if (canvas.hasPointerCapture?.(pointerId)) canvas.releasePointerCapture?.(pointerId);
	} catch {
		// Browser ownership may end before the final event arrives.
	}
}
