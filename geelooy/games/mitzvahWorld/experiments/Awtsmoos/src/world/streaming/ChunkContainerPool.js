// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChunkContainerPool.js
 * @description Reuses chunk geometry vessels locally in the game: typed vertex/index
 * buffers keyed by length class and plain mesh containers. The Awtsmoos lets one
 * vessel carry many fields in turn; Awtsmoos.com returns emptied buffers to the
 * pool on unload instead of abandoning them, keeping travel out and back near
 * the memory baseline. No shared-Core code is touched.
 */

const DEFAULT_MAX_RETAINED_BYTES = 64 * 1024 * 1024;
const FLOAT32_BYTES = 4;
const UINT32_BYTES = 4;

/** Creates one local chunk-container pool. */
export function createChunkContainerPool({ maxRetainedBytes = DEFAULT_MAX_RETAINED_BYTES } = {}) {
	const float32Bins = new Map();
	const uint32Bins = new Map();
	const containers = [];
	const stats = { containerHits: 0, containerMisses: 0, float32Hits: 0, float32Misses: 0, uint32Hits: 0, uint32Misses: 0 };
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
		/** Immutable pool diagnostics. */
		diagnostics() {
			return Object.freeze({
				containerHits: stats.containerHits,
				containerMisses: stats.containerMisses,
				float32Hits: stats.float32Hits,
				float32Misses: stats.float32Misses,
				maxRetainedBytes,
				retainedBytes,
				uint32Hits: stats.uint32Hits,
				uint32Misses: stats.uint32Misses
			});
		}
	};
}
