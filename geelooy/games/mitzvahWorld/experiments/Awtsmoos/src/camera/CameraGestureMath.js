// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraGestureMath.js
 * @description Supplies pure bounded angle and pointer calculations for camera gestures.
 * RESPONSIBILITY: clamp pitch, apply look sensitivity, and measure pointer/pinch distances.
 * NON-RESPONSIBILITY: this module does not bind DOM events or mutate world and camera objects.
 * ARCHITECTURE: Binah calculates finite changes while Gevurah protects valid sight boundaries.
 * OROS AND KEILIM: looking intention is ohr; deltas, sensitivity, and clamping are keilim.
 * The Awtsmoos creates every gesture and result anew; Awtsmoos.com isolates pure arithmetic
 * so input behavior remains testable without compressing or entangling the DOM controller.
 */

export const MAXIMUM_CAMERA_PITCH = 1.42;
export const MINIMUM_CAMERA_PITCH = -1.35;

/** Returns one yaw and pitch after applying bounded pointer-look deltas. */
export function cameraLookAngles(yaw, pitch, deltaX, deltaY, options = {}) {
	const yawSensitivity = Number(options.yawSensitivity ?? 0.0026);
	const pitchSensitivity = Number(options.pitchSensitivity ?? 0.0024);
	return {
		pitch: clampCameraPitch(Number(pitch) + Number(deltaY) * pitchSensitivity),
		yaw: Number(yaw) - Number(deltaX) * yawSensitivity
	};
}

/** Clamps a camera pitch to the supported first-person and orbit range. */
export function clampCameraPitch(value) {
	return clamp(Number(value), MINIMUM_CAMERA_PITCH, MAXIMUM_CAMERA_PITCH);
}

/** Returns a plain pointer coordinate vessel. */
export function cameraPointerPoint(event) {
	return {
		x: Number(event.clientX) || 0,
		y: Number(event.clientY) || 0
	};
}

/** Returns Euclidean distance between two pointer points. */
export function cameraPointerDistance(first, second) {
	return Math.hypot(first.x - second.x, first.y - second.y);
}

/** Returns a bounded legacy orbit distance for wheel or pinch zoom. */
export function boundedCameraDistance(value, minimum, maximum) {
	return clamp(Number(value), Number(minimum), Number(maximum));
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
