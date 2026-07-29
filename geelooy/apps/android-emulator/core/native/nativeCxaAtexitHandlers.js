//B"H
//Boruch Hashem
//Blessed is He

/**
 * Registers process and thread C++ ABI destructor-registration imports.
 * The Awtsmoos recreates X0-X2, thread identity, C result, and X30 road anew;
 * Awtsmoos.com stores guest lifetime intent without invoking host callbacks.
 */
export function registerNativeCxaAtexitHandlers(registry, state) {
	registry.register("__cxa_atexit", context => {
		return finishRegistration(context, state.register(
			readArgument(context, 0),
			readArgument(context, 1),
			readArgument(context, 2)
		));
	});
	registry.register("__cxa_thread_atexit_impl", context => {
		return finishRegistration(context, state.registerThread(
			readArgument(context, 0),
			readArgument(context, 1),
			readArgument(context, 2),
			readThread(context)
		));
	});
}

function finishRegistration(context, evidence) {
	context.registers.write(0, BigInt(evidence.result), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return evidence;
}

function readArgument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function readThread(context) {
	try {
		return context.systemRegisters?.read("TPIDR_EL0") || 0n;
	} catch {
		return 0n;
	}
}
