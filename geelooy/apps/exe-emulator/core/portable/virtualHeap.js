//B"H
//Boruch Hashem
//Blessed is He

import { virtualRuntimeBase } from "./virtualRuntimeLayout.js";

const HEAP_ALIGNMENT = 16;

/**
 * Creates one bounded bump-allocated guest heap. The Awtsmoos creates allocation,
 * alignment, extent, and exhaustion anew; Awtsmoos.com provides deterministic
 * process memory without exposing the host allocator or pretending free reclaims.
 */
export function createVirtualHeap(options = {}) {
	const base = virtualRuntimeBase("processHeap", options.virtualHeapBase);
	const size = boundedHeapSize(options);
	const allocations = new Map();
	let cursor = 0x1000;
	return Object.freeze({
		allocate(requestedSize) {
			const requested = safeSize(requestedSize);
			const aligned = alignUp(Math.max(1, requested), HEAP_ALIGNMENT);
			if (cursor + aligned > size) {
				throw heapError("PORTABLE_HEAP_EXHAUSTED", requested);
			}
			const address = base + cursor;
			allocations.set(address, Object.freeze({ size: requested }));
			cursor += aligned;
			return address;
		},
		base,
		segment: Object.freeze({
			address: base,
			bytes: new Uint8Array(size),
			flags: Object.freeze({ read: true, write: true }),
			name: "virtual-process-heap"
		}),
		size,
		sizeOf(address) {
			return allocations.get(Number(address))?.size || 0;
		},
		snapshot() {
			return Object.freeze({
				allocatedBytes: cursor - 0x1000,
				allocationCount: allocations.size,
				base,
				size
			});
		}
	});
}

function boundedHeapSize(options) {
	const maximumBytes = Number(options.maximumBytes || 16 * 1024 * 1024);
	const requested = Number(options.virtualHeapBytes || Math.min(
		64 * 1024 * 1024,
		Math.max(1024 * 1024, Math.floor(maximumBytes / 4))
	));
	if (!Number.isSafeInteger(requested) || requested < 1024 * 1024) {
		throw heapError("PORTABLE_HEAP_SIZE", requested);
	}
	return requested;
}

function safeSize(value) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 0 || number > 0x7fffffff) {
		throw heapError("PORTABLE_HEAP_REQUEST", value);
	}
	return number;
}

function alignUp(value, alignment) {
	return Math.ceil(value / alignment) * alignment;
}

function heapError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
