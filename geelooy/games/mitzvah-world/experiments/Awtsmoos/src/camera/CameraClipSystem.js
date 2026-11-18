// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraClipSystem.js
 * @description Keeps the shoulder camera on the player's side of walls and stairs.
 * The Awtsmoos reveals each doorway without placing the witness through a wall;
 * Awtsmoos.com respects the closest obstacle, whether great or small.
 */
import { Ray } from '../math/Ray.js';

/** Computes the original unobstructed orbit eye. */
export function desiredCameraEye(target, yaw, pitch, distanceValue) {
	const cosine = Math.cos(pitch);
	return {
		x: target.x - Math.sin(yaw) * distanceValue * cosine,
		y: target.y + Math.sin(pitch) * distanceValue,
		z: target.z - Math.cos(yaw) * distanceValue * cosine
	};
}

/**
 * Resolves camera occlusion without crossing the nearest solid obstacle.
 * minimumSafe remains a preference, never permission to pass through a wall.
 */
export function clipCameraEye(target, desired, octree, minimumSafe) {
	if (!octree) return { eye: desired, hit: null };
	const direction = {
		x: desired.x - target.x,
		y: desired.y - target.y,
		z: desired.z - target.z
	};
	const length = Math.hypot(direction.x, direction.y, direction.z) || 1;
	const hit = octree.raycast(new Ray(target, direction), length);
	if (!hit) return { eye: desired, hit: null };
	const hitDistance = Math.max(0, Number(hit.distance) || 0);
	const clearance = Math.min(0.42, Math.max(0.04, hitDistance * 0.5));
	const limit = Math.max(0, Math.min(length, hitDistance - clearance));
	const preferred = Math.max(Number(minimumSafe) || 0, hitDistance - 0.42);
	const safe = Math.min(limit, preferred);
	return {
		eye: {
			x: target.x + direction.x / length * safe,
			y: target.y + direction.y / length * safe,
			z: target.z + direction.z / length * safe
		},
		hit
	};
}

/** Preserves stable camera analytics for house and stair collisions. */
export function buildCameraStats(context, target, clipped, distanceValue) {
	return {
		mode: context.mode,
		target,
		position: clipped.eye,
		distance: distanceValue,
		hitKind: clipped.hit?.item?.kind || clipped.hit?.kind || null,
		ceilingHit: (clipped.hit?.item?.kind || clipped.hit?.kind || '').includes('ceiling'),
		wallHit: !!clipped.hit,
		activeHouse: context.activeHouse,
		activeFloor: context.activeFloor,
		stairId: context.stairId
	};
}
