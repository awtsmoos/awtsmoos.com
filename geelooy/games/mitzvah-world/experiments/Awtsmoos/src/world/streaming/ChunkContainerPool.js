// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChunkContainerPool.js
 * @description Reuses chunk geometry vessels locally in the game: typed vertex/index
 * buffers keyed by length class, plain mesh containers, shared materials keyed by
 * material key, and vegetation instance batches keyed by capacity class. The
 * Awtsmoos lets one vessel carry many fields in turn; Awtsmoos.com returns emptied
 * buffers to the pool on unload instead of abandoning them, keeping travel out
 * and back near the memory baseline. Materials are shared by key with a reference
 * count (one material object per key, never one per chunk load); vegetation
 * batches are cleared and reused by capacity class. No shared-Core code is touched.
 */

const DEFAULT_MAX_RETAINED_BYTES = 64 * 1024 * 1024;
const FLOAT32_BYTES = 4;
const UINT32_BYTES = 4;

/** Creates one local chunk-container pool. */
export function createChunkContainerPool({ maxRetainedBytes = DEFAULT_MAX_RETAINED_BYTES } = {}) {
	const float32Bins = new Map();
	const uint32Bins = new Map();
	const containers = [];
	const materials = new Map();
	const vegetationBins = new Map();
	const stats = {
		containerHits: 0,
		containerMisses: 0,
		float32Hits: 0,
		float32Misses: 0,
		materialHits: 0,
		materialMisses: 0,
		uint32Hits: 0,
		uint32Misses: 0,
		vegetationBatchHits: 0,
		vegetationBatchMisses: 0
	};
	let retainedBytes = 0;

	function takeBin(bins, length) {
		const bin = bins.get(length);
		if (bin && bin.length > 0) return bin.pop() || null;
		return null;
	}

	function giveBin(bins, array, bytesPerElement, hitsKey, missesKey) {
		const length = array.length;
		const bytes = length * bytesPerElement;
		if (retainedBytes + bytes > maxRetainedBytes) {
			stats[missesKey] += 1;
			return false;
		}
		let bin = bins.get(length);
		if (!bin) {
			bin = [];
			bins.set(length, bin);
		}
		array.fill(0);
		bin.push(array);
		retainedBytes += bytes;
		return true;
	}

	return {
		/** Borrows a Float32Array of exactly length, pooled when the class was seen. */
		acquireFloat32(length) {
			const found = takeBin(float32Bins, length);
			if (found) {
				retainedBytes -= length * FLOAT32_BYTES;
				stats.float32Hits += 1;
				return found;
			}
			stats.float32Misses += 1;
			return new Float32Array(length);
		},
		/** Returns a Float32Array to the pool; oversized returns are dropped, never retained. */
		releaseFloat32(array) {
			if (!(array instanceof Float32Array)) return false;
			return giveBin(float32Bins, array, FLOAT32_BYTES, 'float32Hits', 'float32Misses');
		},
		/** Borrows a Uint32Array of exactly length, pooled when the class was seen. */
		acquireUint32(length) {
			const found = takeBin(uint32Bins, length);
			if (found) {
				retainedBytes -= length * UINT32_BYTES;
				stats.uint32Hits += 1;
				return found;
			}
			stats.uint32Misses += 1;
			return new Uint32Array(length);
		},
		/** Returns a Uint32Array to the pool; oversized returns are dropped, never retained. */
		releaseUint32(array) {
			if (!(array instanceof Uint32Array)) return false;
			return giveBin(uint32Bins, array, UINT32_BYTES, 'uint32Hits', 'uint32Misses');
		},
		/** Borrows one plain mesh container { positions, uvs, indices, meta }. */
		acquireContainer() {
			const found = containers.pop();
			if (found) {
				stats.containerHits += 1;
				found.meta.reused += 1;
				return found;
			}
			stats.containerMisses += 1;
			return { indices: null, meta: { reused: 0 }, positions: null, uvs: null };
		},
		/** Returns a mesh container; held typed arrays must be released separately. */
		releaseContainer(container) {
			if (!container || typeof container !== 'object') return false;
			container.positions = null;
			container.uvs = null;
			container.indices = null;
			containers.push(container);
			return true;
		},
		/**
		 * Borrows the shared material record for a key. The first acquire for a
		 * key builds the record with `create` (called once per key); later
		 * acquires return the SAME object with an incremented reference count,
		 * so ten chunk loads share one material instead of allocating ten.
		 */
		acquireMaterial(key, create) {
			if (typeof key !== 'string' || key.length === 0) {
				throw new TypeError('Material key must be a nonempty string.');
			}
			const existing = materials.get(key);
			if (existing) {
				existing.refs += 1;
				stats.materialHits += 1;
				return existing.record;
			}
			if (typeof create !== 'function') {
				throw new TypeError('A material factory is required for a new key.');
			}
			const record = create(key);
			if (!record || typeof record !== 'object') {
				throw new TypeError('Material factory must return an object.');
			}
			materials.set(key, { record, refs: 1 });
			stats.materialMisses += 1;
			return record;
		},
		/**
		 * Releases one reference to a shared material. The record stays pooled
		 * (retained for the next chunk that needs the same key); it is only
		 * dropped when its reference count reaches zero and `drop` is true.
		 * Returns the remaining reference count, or -1 for an unknown key.
		 */
		releaseMaterial(key, { drop = false } = {}) {
			const existing = materials.get(key);
			if (!existing) return -1;
			existing.refs = Math.max(0, existing.refs - 1);
			if (existing.refs === 0 && drop) materials.delete(key);
			return existing.refs;
		},
		/** Returns the pooled material record for a key without changing refs, or null. */
		peekMaterial(key) {
			return materials.get(key)?.record ?? null;
		},
		/**
		 * Borrows one vegetation instance batch: a plain array stamped with its
		 * capacity class. Released batches are cleared (length 0) and reused,
		 * so per-chunk vegetation lists never allocate a fresh array per load.
		 */
		acquireVegetationBatch(capacity) {
			const size = Math.max(0, Math.trunc(capacity) || 0);
			const bin = vegetationBins.get(size);
			if (bin && bin.length > 0) {
				stats.vegetationBatchHits += 1;
				return bin.pop();
			}
			stats.vegetationBatchMisses += 1;
			const batch = [];
			batch.capacity = size;
			return batch;
		},
		/** Returns a vegetation batch; its entries are cleared before reuse. */
		releaseVegetationBatch(batch) {
			if (!Array.isArray(batch) || !Number.isFinite(batch.capacity)) return false;
			batch.length = 0;
			let bin = vegetationBins.get(batch.capacity);
			if (!bin) {
				bin = [];
				vegetationBins.set(batch.capacity, bin);
			}
			bin.push(batch);
			return true;
		},
		/** Immutable pool diagnostics. */
		diagnostics() {
			let materialRefs = 0;
			for (const entry of materials.values()) materialRefs += entry.refs;
			let vegetationBatchesRetained = 0;
			for (const bin of vegetationBins.values()) vegetationBatchesRetained += bin.length;
			return Object.freeze({
				containerHits: stats.containerHits,
				containerMisses: stats.containerMisses,
				float32Hits: stats.float32Hits,
				float32Misses: stats.float32Misses,
				materialCount: materials.size,
				materialHits: stats.materialHits,
				materialMisses: stats.materialMisses,
				materialRefs,
				maxRetainedBytes,
				retainedBytes,
				uint32Hits: stats.uint32Hits,
				uint32Misses: stats.uint32Misses,
				vegetationBatchHits: stats.vegetationBatchHits,
				vegetationBatchMisses: stats.vegetationBatchMisses,
				vegetationBatchesRetained
			});
		}
	};
}
