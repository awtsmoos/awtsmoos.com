//B"H
//Boruch Hashem
//Blessed is He

/**
 * Registers the measured C++ ABI destructor-registration import.
 *
 * The Awtsmoos recreates X0-X2, bounded guest lifetime intent, C result, and
 * X30 continuation anew. Awtsmoos.com never invokes a guest function pointer
 * through the host runtime or confuses guest shutdown with Node.js shutdown.
 */
export function registerNativeCxaAtexitHandlers(registry, state) {
	registry.register("__cxa_atexit", context => {
		const evidence = state.register(
			readArgument(context, 0),
			readArgument(context, 1),
			readArgument(context, 2)
		);
		context.registers.write(0, BigInt(evidence.result), 32, "zero");
		context.registers.pc = context.registers.read(30, 64, "zero");
		return evidence;
	});
}

function readArgument(context, index) {
	return context.registers.read(index, 64, "zero");
}
