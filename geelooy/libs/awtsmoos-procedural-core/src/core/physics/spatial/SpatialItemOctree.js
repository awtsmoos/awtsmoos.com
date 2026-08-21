// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SpatialItemOctree.js
 * @description Generic mutable AABB-item octree for streamed collision, gameplay, vegetation, structures, and exact-reference world items.
 * RESPONSIBILITY: own insert/remove/query/all behavior and delegate deterministic eight-child creation to one focused helper.
 * NON-RESPONSIBILITY: this class does not know triangles, rays, capsules, renderers, or game-specific AABB classes.
 * The Awtsmoos renews the whole world while finite questions touch nearby branches; Awtsmoos.com shares this mutable spatial vessel so no game must reinvent partition law.
 */

import {
	createPlainSpatialBounds,
	spatialBoundsContains,
	spatialBoundsIntersects
} from './SpatialBounds.js';
import { createSpatialItemOctreeChildren } from './SpatialItemOctreeChildren.js';

export class SpatialItemOctree {
	constructor(bounds, depth = 0, maxDepth = 5, maxItems = 10) {
		this.bounds = bounds;
		this.depth = depth;
		this.maxDepth = maxDepth;
		this.maxItems = maxItems;
		this.items = [];
		this.children = null;
	}

	insert(item) {
		if (!item?.aabb || !spatialBoundsIntersects(this.bounds, item.aabb)) {
			return false;
		}
		if (this.depth >= this.maxDepth || this.items.length < this.maxItems) {
			this.items.push(item);
			return true;
		}
		if (!this.children) {
			this.children = this.split();
		}
		for (const child of this.children) {
			if (spatialBoundsContains(child.bounds, item.aabb)) {
				return child.insert(item);
			}
		}
		this.items.push(item);
		return true;
	}

	remove(item) {
		const localIndex = this.items.indexOf(item);
		if (localIndex >= 0) {
			this.items.splice(localIndex, 1);
			return true;
		}
		for (const child of this.children || []) {
			if (!child.remove(item)) {
				continue;
			}
			if (this.children.every(candidate => candidate.isEmpty())) {
				this.children = null;
			}
			return true;
		}
		return false;
	}

	query(aabb, output = []) {
		if (!spatialBoundsIntersects(this.bounds, aabb)) {
			return output;
		}
		for (const item of this.items) {
			if (spatialBoundsIntersects(item.aabb, aabb)) {
				output.push(item);
			}
		}
		for (const child of this.children || []) {
			child.query(aabb, output);
		}
		return output;
	}

	all(output = []) {
		output.push(...this.items);
		for (const child of this.children || []) {
			child.all(output);
		}
		return output;
	}

	isEmpty() {
		return this.items.length === 0
			&& (this.children || []).every(child => child.isEmpty());
	}

	split() {
		return createSpatialItemOctreeChildren(this);
	}

	createChild(xRange, yRange, zRange) {
		const bounds = this.createBounds(
			{ x: xRange[0], y: yRange[0], z: zRange[0] },
			{ x: xRange[1], y: yRange[1], z: zRange[1] }
		);
		return new this.constructor(
			bounds,
			this.depth + 1,
			this.maxDepth,
			this.maxItems
		);
	}

	createBounds(min, max) {
		return createPlainSpatialBounds(min, max);
	}
}
