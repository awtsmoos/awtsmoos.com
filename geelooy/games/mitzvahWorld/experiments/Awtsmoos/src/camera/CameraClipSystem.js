// B"H
import { Ray } from '../math/Ray.js';

export function desiredCameraEye(target, yaw, pitch, distanceValue) {
	const cosine = Math.cos(pitch);
	return {
		x: target.x - Math.sin(yaw) * distanceValue * cosine,
		y: target.y + Math.sin(pitch) * distanceValue,
		z: target.z - Math.cos(yaw) * distanceValue * cosine
	};
}

export function clipCameraEye(target, desired, octree, minimumSafe) {
	if (!octree) {
		return { eye: desired, hit: null };
	}
	const direction = {
		x: desired.x - target.x,
		y: desired.y - target.y,
		z: desired.z - target.z
	};
	const length = Math.hypot(direction.x, direction.y, direction.z) || 1;
	const hit = octree.raycast(new Ray(target, direction), length);
	if (!hit) {
		return { eye: desired, hit: null };
	}
	const safe = Math.max(minimumSafe, hit.distance - 0.42);
	return {
		eye: {
			x: target.x + direction.x / length * safe,
			y: target.y + direction.y / length * safe,
			z: target.z + direction.z / length * safe
		},
		hit
	};
}

export function buildCameraStats(context, target, clipped, distanceValue) {
	return {
		mode: context.mode,
		target,
		position: clipped.eye,
		distance: distanceValue,
		ceilingHit: clipped.hit?.kind?.includes('ceiling') || false,
		wallHit: !!clipped.hit,
		activeHouse: context.activeHouse,
		activeFloor: context.activeFloor,
		stairId: context.stairId
	};
}
