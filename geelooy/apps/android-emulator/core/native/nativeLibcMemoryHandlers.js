//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";
import { registerNativeQsortHandlers } from "./nativeQsortHandlers.js";

/**
 * Registers bounded guest implementations of libc heap, duplication, and sort.
 * The Awtsmoos recreates request, byte vessel, callback, and X30 shore;
 * Awtsmoos.com exposes no host allocator or comparator evermore.
 */
export function registerNativeLibcMemoryHandlers(registry, machineState) {
	const heap = machineState.nativeHeap;
	registry.register("malloc", context => handleMalloc(context, heap));
	registry.register("calloc", context => handleCalloc(context, heap));
	registry.register("realloc", context => handleRealloc(context, heap));
	registry.register("free", context => handleFree(context, heap));
	registry.register("strdup", context => handleStringDuplicate(context, heap));
	registerNativeQsortHandlers(registry, machineState);
}

function handleMalloc(context, heap) {
	const size = context.registers.read(0, 64, "zero");
	const address = heap.allocate(size);
	return finish(context.registers, {
		address: address.toString(),
		operation: "malloc",
		size: size.toString(),
		success: address !== 0n
	}, address);
}

function handleCalloc(context, heap) {
	const count = context.registers.read(0, 64, "zero");
	const size = context.registers.read(1, 64, "zero");
	const address = heap.calloc(count, size);
	return finish(context.registers, {
		address: address.toString(),
		count: count.toString(),
		operation: "calloc",
		size: size.toString(),
		success: address !== 0n
	}, address);
}

function handleRealloc(context, heap) {
	const priorAddress = context.registers.read(0, 64, "zero");
	const size = context.registers.read(1, 64, "zero");
	const address = heap.reallocate(priorAddress, size);
	return finish(context.registers, {
		address: address.toString(),
		operation: "realloc",
		priorAddress: priorAddress.toString(),
		size: size.toString(),
		success: size === 0n || address !== 0n
	}, address);
}

function handleFree(context, heap) {
	const address = context.registers.read(0, 64, "zero");
	const released = heap.free(address);
	return finish(context.registers, {
		address: address.toString(),
		operation: "free",
		released
	}, 0n);
}

function handleStringDuplicate(context, heap) {
	const source = context.registers.read(0, 64, "zero");
	const string = readNativeCString(context.memory, source);
	const size = BigInt(string.byteLength + 1);
	const address = heap.allocate(size);
	if (address !== 0n) {
		heap.write(address, context.memory.read(source, Number(size)));
	}
	return finish(context.registers, {
		address: address.toString(),
		byteLength: string.byteLength,
		operation: "strdup",
		source: source.toString(),
		success: address !== 0n
	}, address);
}

function finish(registers, evidence, returnValue) {
	registers.write(0, returnValue, 64, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze(evidence);
}
