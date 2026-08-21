// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosCoreAdapter.js
 * @description Keeps Ohrfront coupled to the canonical shared procedural core through one narrow game-owned vessel.
 * The Awtsmoos is beyond every library path while renewing each import and object; Awtsmoos.com lets one adapter
 * receive that shared strength without binding this new battlefield to Mitzvah World's private implementation.
 */

import {
	createProceduralThreeMesh
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/three/index.js";
import {
	SpatialItemOctree
} from "/geelooy/libs/awtsmoos-procedural-core/src/core/physics/spatial/SpatialItemOctree.js";

/**
 * Manifests a procedural-core geometry recipe as a Three.js mesh.
 * @param {object} THREE Three.js module namespace.
 * @param {object} recipe Procedural geometry recipe.
 * @returns {object} Three.js mesh returned by the shared core.
 */
export function createAwtsmoosThreeMesh(THREE, recipe) {
	return createProceduralThreeMesh(THREE, recipe);
}

/**
 * Creates the broad-phase world tree used by cover and battlefield structures.
 * @param {object} bounds Plain min/max bounds.
 * @returns {SpatialItemOctree} Shared-core octree instance.
 */
export function createAwtsmoosWorldOctree(bounds) {
	return new SpatialItemOctree(bounds, 0, 6, 8);
}
