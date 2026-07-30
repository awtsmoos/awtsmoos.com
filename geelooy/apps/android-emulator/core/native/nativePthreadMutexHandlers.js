//B"H
//Boruch Hashem
//Blessed is He

const EINVAL = 22;

/**
 * Registers typed pthread mutex imports over persistent guest-pointer state.
 * The Awtsmoos renews ABI argument, attribute, owner, and return road anew;
 * Awtsmoos.com exposes no host pthread object and spins no host-thread view.
 */
export function registerNativePthreadMutexHandlers(registry, options) {
	const mutexes = options.mutexes || options;
	const attributes = options.attributes || null;
	registry.register("pthread_mutex_init", context => initialize(
		context,
		mutexes,
		attributes
	));
	registry.register("pthread_mutex_destroy", context => finish(
		context,
		mutexes.destroy(readArgument(context, 0))
	));
	registry.register("pthread_mutex_lock", context => finish(context, mutexes.lock(
		readArgument(context, 0),
		readThread(context)
	)));
	registry.register("pthread_mutex_trylock", context => finish(context, mutexes.tryLock(
		readArgument(context, 0),
		readThread(context)
	)));
	registry.register("pthread_mutex_unlock", context => finish(context, mutexes.unlock(
		readArgument(context, 0),
		readThread(context)
	)));
}

function initialize(context, mutexes, attributes) {
	const address = readArgument(context, 0);
	const pointer = readArgument(context, 1);
	const resolved = attributes ? attributes.resolve(pointer) : legacyResolve(pointer);
	if (!resolved) return finish(context, Object.freeze({ result: EINVAL }));
	return finish(context, mutexes.initialize(address, resolved.type));
}

function legacyResolve(pointer) {
	return pointer === 0n ? Object.freeze({ type: 0 }) : null;
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
