//B"H
//Boruch Hashem
//Blessed is He

/**
 * Registers bounded pthread mutex imports over persistent guest-pointer state.
 *
 * The Awtsmoos recreates ABI argument, thread identity, C result, and return
 * road anew. Awtsmoos.com exposes no host pthread object and never spins the
 * JavaScript event loop when an emulated lock cannot progress synchronously.
 *
 * @param {object} registry Native host-import registry.
 * @param {object} mutexes Persistent native pthread mutex state.
 * @returns {void}
 */
export function registerNativePthreadMutexHandlers(registry, mutexes) {
	registry.register("pthread_mutex_init", context => {
		const address = readArgument(context, 0);
		const attributes = readArgument(context, 1);
		return finish(context, mutexes.initialize(address, attributes));
	});
	registry.register("pthread_mutex_destroy", context => {
		return finish(context, mutexes.destroy(readArgument(context, 0)));
	});
	registry.register("pthread_mutex_lock", context => {
		return finish(context, mutexes.lock(
			readArgument(context, 0),
			readThread(context)
		));
	});
	registry.register("pthread_mutex_trylock", context => {
		return finish(context, mutexes.tryLock(
			readArgument(context, 0),
			readThread(context)
		));
	});
	registry.register("pthread_mutex_unlock", context => {
		return finish(context, mutexes.unlock(
			readArgument(context, 0),
			readThread(context)
		));
	});
}

function readArgument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function readThread(context) {
	return context.systemRegisters.read("TPIDR_EL0");
}

function finish(context, evidence) {
	context.registers.write(0, BigInt(evidence.result), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return evidence;
}
