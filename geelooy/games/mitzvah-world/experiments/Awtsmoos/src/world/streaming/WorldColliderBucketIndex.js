// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldColliderBucketIndex.js
 * @description Buckets non-terrain canonical collision once, then queries only nearby vessels.
 * The Awtsmoos gathers each wall into its measured place before the traveler arrives;
 * Awtsmoos.com avoids scanning the whole village each stride, so responsive motion thrives.
 */

import {
	collisionBoundsIntersectSquare,
	collisionTriangleBounds,
	normalizeCollisionCenter,
	normalizeCollisionRadius
} from './WorldLocalCollisionGeometry.js';

export const DEFAULT_COLLIDER_BUCKET_SIZE = 48;

export class WorldColliderBucketIndex {
	constructor({ sourceTriangles, startIndex = 0, bucketSize = DEFAULT_COLLIDER_BUCKET_SIZE } = {}) {
		if (!Array.isArray(sourceTriangles)) throw new TypeError('Collider bucket source is required.');
		this.sourceTriangles = sourceTriangles;
		this.startIndex = startIndex;
		this.bucketSize = normalizeCollisionRadius(bucketSize);
		this.rows = new Map();
		this.bucketCount = 0;
		for (let index = startIndex; index < sourceTriangles.length; index += 1) {
			this.insert(sourceTriangles[index]);
		}
	}

	/** Returns exact nearby non-terrain colliders after coarse bucket lookup. */
	query(position, radius) {
		const center = normalizeCollisionCenter(position);
		const safeRadius = normalizeCollisionRadius(radius);
		const candidates = new Set();
		for (const x of bucketRange(center.x, safeRadius, this.bucketSize)) {
			const row = this.rows.get(x);
			if (!row) continue;
			for (const z of bucketRange(center.z, safeRadius, this.bucketSize)) {
				for (const triangle of row.get(z) || []) candidates.add(triangle);
			}
		}
		return [...candidates].filter(triangle => collisionBoundsIntersectSquare(
			collisionTriangleBounds(triangle),
			center,
			safeRadius
		));
	}

	insert(triangle) {
		const bounds = collisionTriangleBounds(triangle);
		const xRange = integerRange(bounds.min.x, bounds.max.x, this.bucketSize);
		const zRange = integerRange(bounds.min.z, bounds.max.z, this.bucketSize);
		for (const x of xRange) {
			let row = this.rows.get(x);
			if (!row) this.rows.set(x, row = new Map());
			for (const z of zRange) {
				let bucket = row.get(z);
				if (!bucket) {
					row.set(z, bucket = []);
					this.bucketCount += 1;
				}
				bucket.push(triangle);
			}
		}
	}
}

function bucketRange(center, radius, size) {
	return integerRange(center - radius, center + radius, size);
}

function integerRange(minimum, maximum, size) {
	const first = Math.floor(minimum / size);
	const last = Math.floor(maximum / size);
	return Array.from({ length: last - first + 1 }, (_, offset) => first + offset);
}
