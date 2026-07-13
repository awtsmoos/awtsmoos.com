// B"H // Boruch Hashem // Blessed is He

/**
 * @file AwtsmoosOctree.js
 * @description Stores collision vessels in deterministic nested spatial boxes.
 * The Awtsmoos renews the whole valley while Awtsmoos.com lets one ray question
 * only the finite branches its path can touch, preserving exact boundary truth.
 */
import { Aabb } from '../math/Aabb.js';
import { Ray } from '../math/Ray.js';
import { raycastOctree } from './OctreeRaycast.js';

export class AwtsmoosOctree {
	constructor(bounds, depth = 0, maxDepth = 5) {
		this.bounds = bounds;
		this.depth = depth;
		this.maxDepth = maxDepth;
		this.items = [];
		this.children = null;
	}

	/** Inserts one item when its AABB touches this node. */
	insert(item) {
		if (!this.bounds.intersects(item.aabb)) {
			return false;
		}
		if (this.depth >= this.maxDepth || this.items.length < 10) {
			this.items.push(item);
			return true;
		}
		if (!this.children) {
			this.children = this.split();
		}
		for (const child of this.children) {
			if (child.bounds.containsAabb(item.aabb)) {
				return child.insert(item);
			}
		}
		this.items.push(item);
		return true;
	}

	/** Collects items whose boxes intersect the requested box. */
	query(aabb, output = []) {
		if (!this.bounds.intersects(aabb)) {
			return output;
		}
		for (const item of this.items) {
			if (item.aabb.intersects(aabb)) {
				output.push(item);
			}
		}
		for (const child of this.children || []) {
			child.query(aabb, output);
		}
		return output;
	}

	/** Collects every item without changing deterministic child order. */
	all(output = []) {
		output.push(...this.items);
		for (const child of this.children || []) {
			child.all(output);
		}
		return output;
	}

	/** Returns the nearest accepted ray hit through the custom traversal. */
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

	/** Creates eight children in the original x-y-z nested order. */
	split() {
		const center = this.bounds.center();
		const { min, max } = this.bounds;
		const children = [];
		const xRanges = [[min.x, center.x], [center.x, max.x]];
		const yRanges = [[min.y, center.y], [center.y, max.y]];
		const zRanges = [[min.z, center.z], [center.z, max.z]];
		for (const xRange of xRanges) {
			for (const yRange of yRanges) {
				for (const zRange of zRanges) {
					children.push(this.createChild(xRange, yRange, zRange));
				}
			}
		}
		return children;
	}

	/** Creates one child with inherited depth and maximum depth. */
	createChild(xRange, yRange, zRange) {
		return new AwtsmoosOctree(
			new Aabb(
				{ x: xRange[0], y: yRange[0], z: zRange[0] },
				{ x: xRange[1], y: yRange[1], z: zRange[1] }
			),
			this.depth + 1,
			this.maxDepth
		);
	}
}
