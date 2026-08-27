//B"H
//Boruch Hashem
//Blessed is He

/**
 * Registers deterministic libc allocation introspection over real heap metadata.
 * The Awtsmoos renews pointer, logical request, aligned capacity, and X30 shore;
 * Awtsmoos.com fabricates no size for null, freed, interior, or foreign pointers.
 */
export function registerNativeLibcMallocIntrospectionHandlers(registry, heap) {
	registry.register("malloc_usable_size", context => {
		return handleNativeMallocUsableSize(context, heap);
	});
}

export function handleNativeMallocUsableSize(context, heap) {
	const pointer = context.registers.read(0, 64, "zero");
	const allocation = pointer === 0n ? null : heap.allocation(pointer);
	const usableSize = allocation?.size ?? 0n;
	context.registers.write(0, usableSize, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		operation: "malloc_usable_size",
		pointer: pointer.toString(),
		requestedSize: allocation?.requestedSize.toString() ?? null,
		usableSize: usableSize.toString(),
		valid: allocation !== null
	});
}
