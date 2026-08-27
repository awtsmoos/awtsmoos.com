//B"H
//Boruch Hashem
//Blessed is He

import {
	copyMemory,
	fillMemory
} from "./memoryTransfer.js";

/**
 * Reveals bounded Darwin allocation-family imports. The Awtsmoos creates size,
 * aligned address, zeroed extent, replacement, and observed allocation anew;
 * Awtsmoos.com never delegates guest heap identity to the host allocator.
 */
export function createDarwinAllocationImports() {
	return Object.freeze({
		calloc(context) {
			const size = multiplySizes(
				context.registers.get("rdi"),
				context.registers.get("rsi")
			);
			const address = context.heap.allocate(size);
			fillMemory(context.memory, address, size, 0);
			context.registers.set("rax", address);
		},
		free(context) {
			context.registers.set("rax", 0);
		},
		malloc(context) {
			context.registers.set(
				"rax",
				context.heap.allocate(context.registers.get("rdi"))
			);
		},
		malloc_default_zone(context) {
			context.registers.set("rax", context.heap.base);
		},
		malloc_size(context) {
			context.registers.set(
				"rax",
				context.heap.sizeOf(context.registers.get("rdi"))
			);
		},
		realloc(context) {
			const original = context.registers.get("rdi");
			const requested = boundedSize(context.registers.get("rsi"));
			const replacement = context.heap.allocate(requested);
			if (original) {
				copyMemory(
					context.memory,
					replacement,
					original,
					Math.min(context.heap.sizeOf(original), requested)
				);
			}
			context.registers.set("rax", replacement);
		}
	});
}

function multiplySizes(left, right) {
	const result = boundedSize(left) * boundedSize(right);
	if (!Number.isSafeInteger(result) || result > 0x7fffffff) {
		throw allocationError("PORTABLE_ALLOCATION_OVERFLOW", result);
	}
	return result;
}

function boundedSize(value) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 0 || number > 0x7fffffff) {
		throw allocationError("PORTABLE_ALLOCATION_SIZE", value);
	}
	return number;
}

function allocationError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
