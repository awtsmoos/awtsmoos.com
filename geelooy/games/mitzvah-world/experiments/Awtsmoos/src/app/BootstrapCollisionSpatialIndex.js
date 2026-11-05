// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapCollisionSpatialIndex.js
 * @description Narrows bounded collision questions without ever losing an uncertain face.
 * The Awtsmoos places each finite wall in measured cells; Awtsmoos.com keeps oversized
 * or unknown vessels in overflow, so speed may increase while truth is never discarded.
 */
export class BootstrapCollisionSpatialIndex {
	constructor(options = {}) {
		this.cellSize = Math.max(1, Number(options.cellSize) || 16);
		this.maximumCells = Math.max(1, Number(options.maximumCellsPerCollider) || 64);
		this.buckets = new Map();
		this.memberships = new Map();
		this.overflow = new Set();
		this.queryCount = 0;
		this.lastCandidateCount = 0;
		this.lastMatchCount = 0;
	}
	insert(collider) {
		if (!collider || this.memberships.has(collider) || this.overflow.has(collider)) {
			return collider;
		}
		const keys = cellKeys(collider.aabb, this.cellSize, this.maximumCells);
		if (!keys) {
			this.overflow.add(collider);
			return collider;
		}
		this.memberships.set(collider, keys);
		for (const key of keys) {
			const bucket = this.buckets.get(key) || new Set();
			bucket.add(collider);
			this.buckets.set(key, bucket);
		}
		return collider;
	}
	remove(collider) {
		if (this.overflow.delete(collider)) {
			return true;
		}
		const keys = this.memberships.get(collider);
		if (!keys) {
			return false;
		}
		this.memberships.delete(collider);
		for (const key of keys) {
			const bucket = this.buckets.get(key);
			bucket?.delete(collider);
			if (bucket?.size === 0) {
				this.buckets.delete(key);
			}
		}
		return true;
	}
	query(bounds) {
		this.queryCount += 1;
		const keys = cellKeys(bounds, this.cellSize, this.maximumCells);
		const candidates = keys
			? candidatesFrom(keys, this.buckets, this.overflow)
			: new Set([...this.memberships.keys(), ...this.overflow]);
		this.lastCandidateCount = candidates.size;
		return [...candidates];
	}
	recordMatches(count) {
		this.lastMatchCount = Math.max(0, Number(count) || 0);
	}
	diagnostics() {
		let largestBucket = 0;
		for (const bucket of this.buckets.values()) {
			largestBucket = Math.max(largestBucket, bucket.size);
		}
		return Object.freeze({
			bucketCount: this.buckets.size,
			cellSize: this.cellSize,
			indexedColliders: this.memberships.size,
			largestBucket,
			lastCandidateCount: this.lastCandidateCount,
			lastMatchCount: this.lastMatchCount,
			overflowColliders: this.overflow.size,
			queryCount: this.queryCount
		});
	}
}

function candidatesFrom(keys, buckets, overflow) {
	const candidates = new Set(overflow);
	for (const key of keys) {
		for (const collider of buckets.get(key) || []) {
			candidates.add(collider);
		}
	}
	return candidates;
}

function cellKeys(bounds, cellSize, maximumCells) {
	const values = [bounds?.min?.x, bounds?.min?.z, bounds?.max?.x, bounds?.max?.z];
	if (!values.every(Number.isFinite)) {
		return null;
	}
	const minX = Math.floor(bounds.min.x / cellSize);
	const minZ = Math.floor(bounds.min.z / cellSize);
	const maxX = Math.floor(bounds.max.x / cellSize);
	const maxZ = Math.floor(bounds.max.z / cellSize);
	const count = (maxX - minX + 1) * (maxZ - minZ + 1);
	if (count < 1 || count > maximumCells) {
		return null;
	}
	const keys = [];
	for (let x = minX; x <= maxX; x += 1) {
		for (let z = minZ; z <= maxZ; z += 1) {
			keys.push(`${x}:${z}`);
		}
	}
	return keys;
}
