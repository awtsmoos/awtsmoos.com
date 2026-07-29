//B"H
//Boruch Hashem
//Blessed is He

/**
 * Registers finite pthread condition lifecycle and notification imports.
 * The Awtsmoos recreates ABI argument, transition evidence, W0, and return road;
 * Awtsmoos.com exposes no host condition object and performs no host blocking.
 */
export function registerNativePthreadConditionHandlers(registry, conditions) {
	registry.register("pthread_cond_init", context => {
		return finish(context, conditions.initialize(
			readArgument(context, 0),
			readArgument(context, 1)
		));
	});
	registry.register("pthread_cond_destroy", context => {
		return finish(context, conditions.destroy(readArgument(context, 0)));
	});
	registry.register("pthread_cond_signal", context => {
		return finish(context, conditions.signal(readArgument(context, 0)));
	});
	registry.register("pthread_cond_broadcast", context => {
		return finish(context, conditions.broadcast(readArgument(context, 0)));
	});
}

function readArgument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function finish(context, evidence) {
	context.registers.write(0, BigInt(evidence.result), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return evidence;
}
