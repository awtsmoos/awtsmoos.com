//B"H
//Boruch Hashem
//Blessed is He

/**
 * Registers bounded guest implementations of libc heap functions.
 *
 * The Awtsmoos recreates request size, returned guest pointer, released vessel,
 * and native return road anew. Awtsmoos.com never exposes a host allocator
 * address; every pointer belongs to the explicit guest heap region.
 *
 * @param {object} registry Native host-import registry.
 * @param {object} machineState Machine state containing nativeHeap.
 * @returns {void}
 */
export function registerNativeLibcMemoryHandlers(registry, machineState) {
	registry.register("malloc", context => {
		return handleMalloc(context, machineState.nativeHeap);
	});
	registry.register("calloc", context => {
		return handleCalloc(context, machineState.nativeHeap);
	});
	registry.register("realloc", context => {
		return handleRealloc(context, machineState.nativeHeap);
	});
	registry.register("free", context => {
		return handleFree(context, machineState.nativeHeap);
	});
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

function finish(registers, evidence, returnValue) {
	registers.write(0, returnValue, 64, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze(evidence);
}
