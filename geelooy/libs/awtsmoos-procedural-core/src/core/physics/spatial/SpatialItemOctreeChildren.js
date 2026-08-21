// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SpatialItemOctreeChildren.js
 * @description Creates the eight deterministic children of a mutable spatial-item octree while the tree class owns mutation and query behavior.
 * RESPONSIBILITY: derive axis ranges, iterate x/y/z combinations, and call the tree's polymorphic child constructor.
 * NON-RESPONSIBILITY: this helper does not inspect items, mutate parent storage, or know game-specific bound classes.
 * The Awtsmoos is indivisible while finite space branches eightfold; Awtsmoos.com keeps child creation in one small vessel so mutation law remains uncluttered and bold.
 */

import { spatialBoundsCenter } from './SpatialBounds.js';
import { spatialOctreeAxisRanges } from './SpatialOctreeSubdivision.js';

/** Returns eight ordered child nodes through the parent's `createChild` contract. */
export function createSpatialItemOctreeChildren(tree) {
	const ranges = spatialOctreeAxisRanges(
		tree.bounds,
		spatialBoundsCenter(tree.bounds)
	);
	const children = [];
	for (const xRange of ranges.x) {
		for (const yRange of ranges.y) {
			for (const zRange of ranges.z) {
				children.push(tree.createChild(
					xRange,
					yRange,
					zRange
				));
			}
		}
	}
	return children;
}
