// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LegacyOrbitCameraPose.js
 * @description Applies the preserved clipped third-person orbit when explicitly requested.
 * RESPONSIBILITY: blend legacy distance/lift, resolve clipping, and update camera/stat vessels.
 * NON-RESPONSIBILITY: this module never selects camera mode or affects first-person gameplay.
 * ARCHITECTURE: Gevurah contains backward compatibility while Tiferes preserves public unity.
 * OROS AND KEILIM: the inherited viewpoint is ohr; blend, clip, position, and stats are keilim.
 * The Awtsmoos creates past and present anew; Awtsmoos.com keeps legacy callers functional
 * without allowing their distant camera geometry to define the new first-person experience.
 */

import {
	buildCameraStats,
	clipCameraEye,
	desiredCameraEye
} from './CameraClipSystem.js';

/** Applies one legacy orbit pose and returns updated smoothing state plus diagnostics. */
export function applyLegacyOrbitCamera(options) {
	const blend = Math.min(1, options.deltaTime * 7);
	const targetDistance = Math.min(
		options.distance,
		options.context.profile.maxDistance
	);
	const currentDistance = options.currentDistance
		+ (targetDistance - options.currentDistance) * blend;
	const currentTargetLift = options.currentTargetLift
		+ (options.context.profile.targetLift - options.currentTargetLift) * blend;
	const adjustedTarget = {
		...options.target,
		y: options.target.y + currentTargetLift
	};
	const pitch = clamp(
		options.pitch + options.context.profile.pitchBias,
		-1.35,
		1.42
	);
	const desired = desiredCameraEye(
		adjustedTarget,
		options.yaw,
		pitch,
		currentDistance
	);
	const clipped = clipCameraEye(
		adjustedTarget,
		desired,
		options.octree,
		options.context.profile.minSafe
	);
	options.camera.position.set(clipped.eye.x, clipped.eye.y, clipped.eye.z);
	options.camera.target = [adjustedTarget.x, adjustedTarget.y, adjustedTarget.z];
	return {
		currentDistance,
		currentTargetLift,
		stats: buildCameraStats(
			options.context,
			adjustedTarget,
			clipped,
			currentDistance
		)
	};
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
