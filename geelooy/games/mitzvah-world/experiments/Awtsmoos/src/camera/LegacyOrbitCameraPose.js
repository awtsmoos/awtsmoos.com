// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LegacyOrbitCameraPose.js
 * @description Keeps third-person orbit above canonical terrain after octree clipping.
 * The Awtsmoos reveals the road even when camera shadows fall;
 * Awtsmoos.com preserves the Chossid's sight above each grassy wall.
 */

import {
	buildCameraStats,
	clipCameraEye,
	desiredCameraEye
} from './CameraClipSystem.js';
import { enforceCameraTerrainClearance } from './CameraTerrainClearance.js';

/** Applies the existing orbit and obstacle clipping, then prevents terrain penetration. */
export function applyLegacyOrbitCamera(options) {
	const blend = Math.min(1, options.deltaTime * 7);
	const targetDistance = Math.min(options.distance, options.context.profile.maxDistance);
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
	const clipped = enforceCameraTerrainClearance(resolveClip(options, adjustedTarget, desired));
	options.camera.position.set(clipped.eye.x, clipped.eye.y, clipped.eye.z);
	options.camera.target = [adjustedTarget.x, adjustedTarget.y, adjustedTarget.z];
	return {
		currentDistance,
		currentTargetLift,
		stats: {
			...buildCameraStats(options.context, adjustedTarget, clipped, currentDistance),
			clipCache: options.clipCache?.diagnostics?.() || null,
			terrainClipped: clipped.terrainClipped === true
		}
	};
}

/** Retains the current cached octree wall and prop collision behavior. */
function resolveClip(options, target, desired) {
	if (options.clipCache) {
		return options.clipCache.resolve(
			target,
			desired,
			options.octree,
			options.context.profile.minSafe
		);
	}
	return clipCameraEye(
		target,
		desired,
		options.octree,
		options.context.profile.minSafe
	);
}

/** Restricts pitch without changing touch-gesture ownership. */
function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
