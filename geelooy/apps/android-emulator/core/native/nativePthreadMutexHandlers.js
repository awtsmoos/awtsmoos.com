//B"H
//Boruch Hashem
//Blessed be He

import { lockNativePthreadMutex } from "./nativePthreadMutexBlockingLock.js";

const EINVAL = 22;

/**
 * Registers pthread mutex lifecycle over one normalized guest mutex state.
 *
 * Blocking acquisition delegates to the ownership-aware suspension helper so
 * scheduler-created pthreads and the persistent Flutter/JNI platform identity
 * never share an invalid continuation queue. Unlock remains the only doorway that
 * transfers a genuinely released mutex to one retained managed waiter.
 *
 * @param {object} registry Native import registry receiving pthread entry points.
 * @param {object} options Mutex state plus optional attributes and scheduler.
 * @returns {void} Registration mutates only the supplied native registry.
 */
export function registerNativePthreadMutexHandlers(registry, options) {
	const normalized = normalizeOptions(options);
	const { attributes, mutexes, scheduler } = normalized;
	registry.register("pthread_mutex_init", context => initialize(
		context,
		mutexes,
		attributes
	));
	registry.register("pthread_mutex_destroy", context => finish(
		context,
		mutexes.destroy(argument(context, 0))
	));
	registry.register("pthread_mutex_lock", context => lockNativePthreadMutex(
		context,
		mutexes,
		scheduler
	));
	registry.register("pthread_mutex_trylock", context => finish(
		context,
		mutexes.tryLock(argument(context, 0), thread(context))
	));
	registry.register("pthread_mutex_unlock", context => unlock(
		context,
		mutexes,
		scheduler
	));
}

/** Releases one owned mutex and resumes a retained waiter only after true unlock. */
function unlock(context, mutexes, scheduler) {
	const address = argument(context, 0);
	const evidence = mutexes.unlock(address, thread(context));
	const resumed = evidence.result === 0 && !evidence.locked && scheduler
		? scheduler.wakeMutex(address)
		: Object.freeze([]);
	return finish(context, Object.freeze({
		...evidence,
		resumed
	}));
}

/** Initializes one guest mutex from an emulated pthread attribute record. */
function initialize(context, mutexes, attributes) {
	const address = argument(context, 0);
	const pointer = argument(context, 1);
	const configuration = attributes
		? attributes.resolve(pointer)
		: legacyResolve(pointer);
	if (!configuration) {
		return finish(context, Object.freeze({ result: EINVAL }));
	}
	return finish(context, mutexes.initialize(address, configuration.type));
}

/** Preserves the historical state-only registration shape used by focused tests. */
function normalizeOptions(options) {
	return options?.mutexes
		? options
		: Object.freeze({ attributes: null, mutexes: options, scheduler: null });
}

/** Accepts only Android's default null attribute pointer in legacy mode. */
function legacyResolve(pointer) {
	return pointer === 0n ? Object.freeze({ type: 0 }) : null;
}

/** Reads the active guest TLS identity from TPIDR_EL0. */
function thread(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}

/** Reads one unsigned AAPCS64 integer argument from the guest register file. */
function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}

/** Writes pthread result code and returns through X30 without host-side blocking. */
function finish(context, evidence) {
	context.registers.write(0, BigInt(evidence.result), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return evidence;
}
