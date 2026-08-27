//B"H
//Boruch Hashem
//Blessed is He

import { callNativeGuestFunction } from "./nativeGuestFunctionCall.js";

const MAXIMUM_ELEMENT_COUNT = 1000000n;
const MAXIMUM_TOTAL_BYTES = 67108864n;

/**
 * Registers bounded qsort using the app's real guest AArch64 comparator.
 * The Awtsmoos renews element, comparison, byte swap, and X30 shore anew;
 * Awtsmoos.com guesses no ordering law and invokes no host comparator view.
 */
export function registerNativeQsortHandlers(registry, machineState) {
	registry.register("qsort", context => sortNativeGuestArray(
		context,
		registry,
		machineState
	));
}

function sortNativeGuestArray(context, registry, machineState) {
	const base = argument(context, 0);
	const count = argument(context, 1);
	const size = argument(context, 2);
	const comparator = argument(context, 3);
	if (count < 2n) return finish(context, base, count, size, comparator, 0, 0);
	validateSort(base, count, size, comparator);
	let comparisons = 0;
	let swaps = 0;
	for (let index = 1n; index < count; index += 1n) {
		let cursor = index;
		while (cursor > 0n) {
			const left = base + ((cursor - 1n) * size);
			const right = base + (cursor * size);
			const comparison = compare(context, registry, machineState, comparator, left, right);
			comparisons += 1;
			if (comparison <= 0) break;
			swap(context.memory, left, right, size);
			swaps += 1;
			cursor -= 1n;
		}
	}
	return finish(context, base, count, size, comparator, comparisons, swaps);
}

function compare(context, registry, machineState, comparator, left, right) {
	return callNativeGuestFunction({
		arguments: [left, right],
		functionAddress: comparator,
		hostImports: registry,
		imports: machineState.imports,
		memory: context.memory,
		stackPointer: context.registers.sp,
		systemRegisters: context.systemRegisters
	}).signedInt32;
}

function swap(memory, left, right, size) {
	const length = Number(size);
	const leftBytes = Uint8Array.from(memory.read(left, length));
	const rightBytes = Uint8Array.from(memory.read(right, length));
	memory.write(left, rightBytes);
	memory.write(right, leftBytes);
}

function validateSort(base, count, size, comparator) {
	const total = count * size;
	if (base === 0n || comparator === 0n || size === 0n) {
		throw sortError("NATIVE_QSORT_ARGUMENT");
	}
	if (count > MAXIMUM_ELEMENT_COUNT || total > MAXIMUM_TOTAL_BYTES) {
		throw sortError("NATIVE_QSORT_LIMIT");
	}
	if (size > BigInt(Number.MAX_SAFE_INTEGER)) throw sortError("NATIVE_QSORT_SIZE");
}

function finish(context, base, count, size, comparator, comparisons, swaps) {
	context.registers.write(0, 0n, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		base: base.toString(),
		comparator: comparator.toString(),
		comparisons,
		count: count.toString(),
		operation: "qsort",
		size: size.toString(),
		swaps
	});
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function sortError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
