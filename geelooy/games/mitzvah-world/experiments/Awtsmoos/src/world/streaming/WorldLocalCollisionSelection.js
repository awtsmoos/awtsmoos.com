// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldLocalCollisionSelection.js
 * @description Preserves a linear local-collision fallback for tests and metadata-poor tools.
 * The Awtsmoos keeps the simple path truthful when no indexed vessel can be known;
 * Awtsmoos.com uses the faster shared index in production, while this fallback stands alone.
 */

import {
	collisionBoundsIntersectSquare,
	collisionTriangleBounds,
	normalizeCollisionCenter,
	normalizeCollisionRadius
} from './WorldLocalCollisionGeometry.js';

export const DEFAULT_LOCAL_COLLISION_RADIUS = 56;

/**
 * Selects colliders by exact AABB overlap when no reusable source index is available.
 * @param {Array<object>} colliders Complete canonical collision source.
 * @param {{x:number,z:number}} position Horizontal query center.
 * @param {number} radius Horizontal safety radius.
 * @returns {object} Immutable selection evidence.
 */
export function selectLocalCollisionTriangles(
	colliders,
	position,
	radius = DEFAULT_LOCAL_COLLISION_RADIUS
) {
	if (!Array.isArray(colliders) || colliders.length === 0) {
		throw new TypeError('Canonical collision source must be a non-empty array.');
	}
	const center = normalizeCollisionCenter(position);
	const safeRadius = normalizeCollisionRadius(radius);
	const triangles = [];
	for (const triangle of colliders) {
		const bounds = collisionTriangleBounds(triangle);
		if (!collisionBoundsIntersectSquare(bounds, center, safeRadius)) continue;
		triangles.push(triangle);
	}
	if (triangles.length === 0) {
		throw new Error('Local collision selection produced no safe triangles.');
	}
	return Object.freeze({
		center,
		radius: safeRadius,
		sourceTriangleCount: colliders.length,
		selectedTriangleCount: triangles.length,
		triangles: Object.freeze(triangles)
	});
}
