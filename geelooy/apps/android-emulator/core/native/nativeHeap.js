//B"H
//Boruch Hashem
//Blessed is He

import { createNativeAnonymousMemory } from "./nativeAnonymousMemory.js";
import { createNativeHeapBlocks } from "./nativeHeapBlocks.js";

/**
 * Creates a bounded writable guest heap with libc-compatible allocation roads.
 *
 * The Awtsmoos recreates anonymous byte, allocation identity, preserved resize,
 * and zeroed array anew. Awtsmoos.com exposes only guest addresses while all
 * allocator metadata remains sealed in the JavaScript vessel.
 */
export function createNativeHeap(start, byteLength, options = {}) {
	const region = createNativeAnonymousMemory(start, byteLength, "native-heap");
	const blocks = createNativeHeapBlocks(start, byteLength, options);
	return Object.freeze({
		allocate(size) {
			return blocks.allocate(size);
		},
		allocation(address) {
			return blocks.allocation(address);
		},
		calloc(count, size) {
			const total = multiplySizes(count, size, BigInt(byteLength));
			if (total === null) return 0n;
			const address = blocks.allocate(total);
			if (address !== 0n && total > 0n) {
				region.write(address, new Uint8Array(Number(total)));
			}
			return address;
		},
		contains: region.contains,
		end: region.end,
		free(address) {
			return blocks.free(address);
		},
		label: region.label,
		read: region.read,
		reallocate(address, size) {
			const pointer = BigInt(address);
			const requested = BigInt(size);
			if (pointer === 0n) return blocks.allocate(requested);
			if (requested === 0n) {
				blocks.free(pointer);
				return 0n;
			}
			const prior = blocks.allocation(pointer);
			if (!prior) return blocks.free(pointer);
			if (requested <= prior.size) return pointer;
			const replacement = blocks.allocate(requested);
			if (replacement === 0n) return 0n;
			const copied = prior.requestedSize < requested
				? prior.requestedSize
				: requested;
			if (copied > 0n) region.write(
				replacement,
				region.read(pointer, Number(copied))
			);
			blocks.free(pointer);
			return replacement;
		},
		snapshot() {
			return Object.freeze({
				end: region.end.toString(),
				label: region.label,
				start: region.start.toString(),
				...blocks.snapshot()
			});
		},
		start: region.start,
		write: region.write
	});
}

function multiplySizes(left, right, capacity) {
	const count = BigInt(left);
	const size = BigInt(right);
	if (count < 0n || size < 0n) return null;
	if (count !== 0n && size > capacity / count) return null;
	return count * size;
}
