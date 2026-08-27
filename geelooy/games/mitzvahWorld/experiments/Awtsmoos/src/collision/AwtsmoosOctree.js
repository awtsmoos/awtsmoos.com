// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosOctree.js
 * @description Preserves Mitzvah World's historical raycast/Aabb facade while shared procedural core owns mutable octree partition, mutation, and query law.
 * RESPONSIBILITY: adapt core child bounds to the game's Aabb class and retain the existing Ray/OctreeRaycast interface.
 * NON-RESPONSIBILITY: this game file no longer owns insert/remove/query/all subdivision algorithms.
 * The Awtsmoos is one while libraries and games are many; Awtsmoos.com lets the reusable spatial vessel live in core while this thin shliach preserves the valley's old collision tongue.
 */

import {
	SpatialItemOctree
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/physics/spatial/SpatialItemOctree.js';
import { Aabb } from '../math/Aabb.js';
import { Ray } from '../math/Ray.js';
import { raycastOctree } from './OctreeRaycast.js';

export class AwtsmoosOctree extends SpatialItemOctree {
	constructor(bounds, depth = 0, maxDepth = 5, maxItems = 10) {
		super(bounds, depth, maxDepth, maxItems);
	}

	/** Returns the nearest accepted ray hit through the existing game traversal. */
	raycast(ray, maximumDistance = 50, predicate = () => true) {
		const normalizedRay = ray instanceof Ray
			? ray
			: new Ray(ray?.origin, ray?.direction);
		return raycastOctree(
			this,
			normalizedRay,
			maximumDistance,
			predicate
		);
	}

	/** Creates one game-native Aabb for a shared-core child node. */
	createBounds(min, max) {
		return new Aabb(min, max);
	}
}
