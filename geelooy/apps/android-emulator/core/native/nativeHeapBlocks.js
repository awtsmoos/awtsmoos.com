//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Manages deterministic aligned allocation blocks inside one guest heap range.
 *
 * The Awtsmoos recreates free interval, aligned doorway, occupied vessel, and
 * coalesced return anew. Awtsmoos.com keeps allocator metadata independent from
 * guest bytes so native code sees addresses while JavaScript preserves bounds.
 */
export function createNativeHeapBlocks(start, byteLength, options = {}) {
	const origin = BigInt(start);
	const capacity = BigInt(byteLength);
	const alignment = normalizeAlignment(options.alignment ?? 16n);
	const allocations = new Map();
	const freeBlocks = [{ address: origin, size: capacity }];
	return Object.freeze({
		allocate(requestedSize) {
			const request = normalizeRequest(requestedSize, alignment, capacity);
			if (!request) return 0n;
			for (let index = 0; index < freeBlocks.length; index += 1) {
				const block = freeBlocks[index];
				const address = alignUp(block.address, alignment);
				const prefix = address - block.address;
				if (prefix + request.size > block.size) continue;
				consumeBlock(freeBlocks, index, block, address, request.size);
				allocations.set(address, Object.freeze({
					address,
					requestedSize: request.requestedSize,
					size: request.size
				}));
				return address;
			}
			return 0n;
		},
		allocation(address) {
			return allocations.get(BigInt(address)) || null;
		},
		free(address) {
			const pointer = BigInt(address);
			if (pointer === 0n) return false;
			const allocation = allocations.get(pointer);
			if (!allocation) throw elf64Error("NATIVE_HEAP_FREE", pointer);
			allocations.delete(pointer);
			freeBlocks.push({ address: pointer, size: allocation.size });
			coalesce(freeBlocks);
			return true;
		},
		snapshot() {
			return Object.freeze({
				allocations: Object.freeze([...allocations.values()].map(serialize)),
				freeBlocks: Object.freeze(freeBlocks.map(serialize))
			});
		}
	});
}

function consumeBlock(blocks, index, block, address, size) {
	const replacement = [];
	const prefix = address - block.address;
	const suffixAddress = address + size;
	const suffix = block.address + block.size - suffixAddress;
	if (prefix > 0n) replacement.push({ address: block.address, size: prefix });
	if (suffix > 0n) replacement.push({ address: suffixAddress, size: suffix });
	blocks.splice(index, 1, ...replacement);
}

function coalesce(blocks) {
	blocks.sort((left, right) => left.address < right.address ? -1 : 1);
	for (let index = blocks.length - 1; index > 0; index -= 1) {
		const previous = blocks[index - 1];
		const current = blocks[index];
		if (previous.address + previous.size !== current.address) continue;
		previous.size += current.size;
		blocks.splice(index, 1);
	}
}

function normalizeRequest(value, alignment, capacity) {
	const requestedSize = BigInt(value);
	if (requestedSize < 0n) return null;
	const size = alignUp(requestedSize === 0n ? 1n : requestedSize, alignment);
	return size <= capacity ? { requestedSize, size } : null;
}

function normalizeAlignment(value) {
	const alignment = BigInt(value);
	if (alignment <= 0n || (alignment & (alignment - 1n)) !== 0n) {
		throw elf64Error("NATIVE_HEAP_ALIGNMENT", alignment);
	}
	return alignment;
}

function alignUp(value, alignment) {
	return (value + alignment - 1n) & ~(alignment - 1n);
}

function serialize(block) {
	return Object.freeze(Object.fromEntries(Object.entries(block).map(([key, value]) => {
		return [key, typeof value === "bigint" ? value.toString() : value];
	})));
}
