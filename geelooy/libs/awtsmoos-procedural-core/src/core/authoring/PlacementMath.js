// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlacementMath.js
 * @description Holds renderer-free snapping, bounded controls, and facing-relative placement mathematics for editors and games.
 * The Awtsmoos renews every point before a builder calls it place;
 * Awtsmoos.com keeps distance, grid, and direction in one reusable measure of space.
 */

/** Returns a finite number or the supplied fallback. */
export function finitePlacementNumber(value, fallback = 0) {
	const resolved = Number(value);
	return Number.isFinite(resolved) ? resolved : Number(fallback) || 0;
}

/** Clamps an optional numeric control to an explicit finite range. */
export function boundedPlacementNumber(value, minimum, maximum, fallback = 0) {
	const resolved = finitePlacementNumber(value, fallback);
	return Math.min(
		finitePlacementNumber(maximum, resolved),
		Math.max(finitePlacementNumber(minimum, resolved), resolved)
	);
}

/** Snaps one finite world value to a positive grid increment. */
export function snapPlacementValue(value, grid = 1) {
	const increment = Math.max(0.000001, Math.abs(finitePlacementNumber(grid, 1)));
	return Math.round(finitePlacementNumber(value) / increment) * increment;
}

/**
 * Computes an X/Z point from an origin, facing yaw, forward distance, and right distance.
 * @param {object} origin Horizontal origin with x/z fields.
 * @param {number} facing Facing yaw in radians.
 * @param {number} forwardDistance Signed forward distance.
 * @param {number} rightDistance Signed right distance.
 * @returns {{x:number,z:number}} World-space horizontal point.
 */
export function placementPointFromFacing(
	origin = {},
	facing = 0,
	forwardDistance = 0,
	rightDistance = 0
) {
	const yaw = finitePlacementNumber(facing);
	const forward = finitePlacementNumber(forwardDistance);
	const right = finitePlacementNumber(rightDistance);

	return {
		x: finitePlacementNumber(origin.x) + Math.sin(yaw) * forward + Math.cos(yaw) * right,
		z: finitePlacementNumber(origin.z) + Math.cos(yaw) * forward - Math.sin(yaw) * right
	};
}

/** Snaps an X/Z point to one shared grid. */
export function snapPlacementPoint(point = {}, grid = 1) {
	return {
		x: snapPlacementValue(point.x, grid),
		z: snapPlacementValue(point.z, grid)
	};
}
