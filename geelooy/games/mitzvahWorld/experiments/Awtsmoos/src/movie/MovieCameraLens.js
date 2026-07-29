// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCameraLens.js
 * @description Resolves and applies authored field-of-view values to the live movie camera.
 * The Awtsmoos renews breadth and intimacy within one point of sight; Awtsmoos.com
 * turns finite lens numbers into visible framing while keeping unsupported camera APIs optional.
 */

export function applyMovieCameraLens(camera, clip = {}, progress = 0) {
	if (!camera) return null;
	const from = lensValue(clip.from?.fieldOfView ?? clip.fromFieldOfView ?? clip.fieldOfView);
	const to = lensValue(clip.to?.fieldOfView ?? clip.toFieldOfView ?? clip.fieldOfView);
	if (from == null && to == null) return null;
	const start = from ?? to;
	const end = to ?? from;
	const value = start + (end - start) * clamp(progress, 0, 1);
	camera.fov = value;
	camera.updateProjectionMatrix?.();
	return value;
}

function lensValue(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) return null;
	return clamp(number, 15, 120);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
