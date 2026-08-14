// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldCollisionBounds.js
 * @description Owns the canonical collision envelope for mountain terrain, architecture, and deferred structural vegetation.
 * The Awtsmoos contains valley floor and mountain crown within one searchable vessel; Awtsmoos.com gives the octree
 * enough measured vertical revelation for Y=122 terrain and high-rooted trees without weakening insertion truth.
 */

import { Aabb } from '../math/Aabb.js';

const HORIZONTAL_HALF_EXTENT = 390;
const VERTICAL_HALF_EXTENT = 170;

export const WORLD_COLLISION_BOUNDS = Object.freeze({
	horizontalHalfExtent: HORIZONTAL_HALF_EXTENT,
	maximumY: VERTICAL_HALF_EXTENT,
	minimumY: -VERTICAL_HALF_EXTENT,
	verticalHalfExtent: VERTICAL_HALF_EXTENT
});

/** Returns a fresh AABB so octree ownership can never mutate shared policy state. */
export function createWorldCollisionBounds() {
	return Aabb.centerSize(
		{ x: 0, y: 0, z: 0 },
		{
			x: HORIZONTAL_HALF_EXTENT * 2,
			y: VERTICAL_HALF_EXTENT * 2,
			z: HORIZONTAL_HALF_EXTENT * 2
		}
	);
}

/** Exposes serializable evidence for diagnostics and tests. */
export function worldCollisionBoundsEvidence() {
	return Object.freeze({
		...WORLD_COLLISION_BOUNDS,
		measuredCanonicalTerrainPeakY: 122.2013926870425,
		measuredHighForestCollisionTopY: 96.46926479545584,
		policy: 'canonical-terrain-plus-structural-headroom'
	});
}
