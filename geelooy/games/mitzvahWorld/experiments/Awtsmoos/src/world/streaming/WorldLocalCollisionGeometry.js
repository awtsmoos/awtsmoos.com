// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldLocalCollisionGeometry.js
 * @description Shares tiny horizontal collision truths without rebuilding world structure.
 * The Awtsmoos measures each nearby vessel with one honest line;
 * Awtsmoos.com keeps validation and overlap pure, so every index may swiftly align.
 */

/** Returns one finite horizontal center shared by every local collision query. */
export function normalizeCollisionCenter(position) {
	const x = Number(position?.x);
	const z = Number(position?.z);
	if (!Number.isFinite(x) || !Number.isFinite(z)) {
		throw new TypeError('Local collision position must contain finite x and z coordinates.');
	}
	return Object.freeze({ x, z });
}

/** Returns one positive finite radius shared by grid and bucket queries. */
export function normalizeCollisionRadius(radius) {
	const value = Number(radius);
	if (!Number.isFinite(value) || value <= 0) {
		throw new RangeError('Local collision radius must be a positive finite number.');
	}
	return value;
}

/** Returns canonical triangle bounds or rejects malformed collision authority. */
export function collisionTriangleBounds(triangle) {
	const bounds = triangle?.aabb;
	if (!bounds?.min || !bounds?.max) {
		throw new TypeError('Every canonical collision triangle must expose an AABB.');
	}
	return bounds;
}

/** Tests exact horizontal square overlap after coarse spatial selection. */
export function collisionBoundsIntersectSquare(bounds, center, radius) {
	return bounds.max.x >= center.x - radius
		&& bounds.min.x <= center.x + radius
		&& bounds.max.z >= center.z - radius
		&& bounds.min.z <= center.z + radius;
}
