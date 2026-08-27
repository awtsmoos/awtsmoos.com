// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldLocalCollisionStreamingPolicy.js
 * @description Holds compact ring, motion, discontinuity, and queue policy over one shared source index.
 * The Awtsmoos measures nearness without rescanning creation each stride;
 * Awtsmoos.com lets Chesed load ahead and Gevurah retain a wider guard beside.
 */

export const LOCAL_COLLISION_LOAD_RADIUS = 112;
export const LOCAL_COLLISION_RETAIN_RADIUS = 168;
export const LOCAL_COLLISION_PREFETCH_DISTANCE = 32;
export const LOCAL_COLLISION_REPLAN_DISTANCE = 8;
export const LOCAL_COLLISION_TELEPORT_DISTANCE = 48;
export const LOCAL_COLLISION_OPERATION_BUDGET = 48;

export function normalizeLocalCollisionPosition(position) {
	const x = Number(position?.x);
	const z = Number(position?.z);
	if (!Number.isFinite(x) || !Number.isFinite(z)) {
		throw new TypeError('Player position must contain finite x and z coordinates.');
	}
	return Object.freeze({ x, z });
}

export function resolveLocalCollisionDirection(previous, current) {
	if (!previous) return Object.freeze({ x: 0, z: 0 });
	const x = current.x - previous.x;
	const z = current.z - previous.z;
	const length = Math.hypot(x, z);
	if (length < 0.0001) return Object.freeze({ x: 0, z: 0 });
	return Object.freeze({ x: x / length, z: z / length });
}

export function isLocalCollisionDiscontinuity(previous, current) {
	if (!previous) return false;
	return Math.hypot(current.x - previous.x, current.z - previous.z)
		>= LOCAL_COLLISION_TELEPORT_DISTANCE;
}

export function shouldReplanLocalCollision(previous, current) {
	if (!previous) return true;
	return Math.hypot(current.x - previous.x, current.z - previous.z)
		>= LOCAL_COLLISION_REPLAN_DISTANCE;
}

export function createLocalCollisionStreamingPlan({
	activeTriangles,
	direction,
	position,
	sourceIndex
}) {
	const center = Object.freeze({
		x: position.x + direction.x * LOCAL_COLLISION_PREFETCH_DISTANCE,
		z: position.z + direction.z * LOCAL_COLLISION_PREFETCH_DISTANCE
	});
	const desired = sourceIndex.query(center, LOCAL_COLLISION_LOAD_RADIUS);
	const retained = sourceIndex.query(position, LOCAL_COLLISION_RETAIN_RADIUS);
	const desiredSet = new Set(desired.triangles);
	const retainedSet = new Set(retained.triangles);
	return Object.freeze({
		center,
		additions: desired.triangles.filter(triangle => !activeTriangles.has(triangle)),
		removals: [...activeTriangles].filter(
			triangle => !retainedSet.has(triangle) && !desiredSet.has(triangle)
		)
	});
}

export function normalizeLocalCollisionBudget(value) {
	if (!Number.isSafeInteger(value) || value < 0) {
		throw new TypeError('Local collision budget must be a nonnegative safe integer.');
	}
	return value;
}
