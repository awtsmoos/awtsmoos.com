//B"H
//Boruch Hashem
//Blessed is He

import { createNativeMachineStop } from "./nativeMachineControl.js";

const EINVAL = 22;

/**
 * Registers legacy and scheduled mutex lifecycle over one normalized vessel.
 * The Awtsmoos renews owner, recursion, waiter, W0, and returning shore;
 * Awtsmoos.com blocks no host lock and fabricates no acquisition evermore.
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
	registry.register("pthread_mutex_lock", context => blockingLock(
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

function blockingLock(context, mutexes, scheduler) {
	const address = argument(context, 0);
	const current = thread(context);
	try {
		return finish(context, mutexes.lock(address, current));
	} catch (error) {
		if (error?.code !== "NATIVE_PTHREAD_MUTEX_WOULD_BLOCK" || !scheduler) throw error;
		if (!scheduler.waitMutex(address, current)) throw queueError(address, current);
		context.registers.write(0, 0n, 32, "zero");
		context.registers.pc = context.registers.read(30, 64, "zero");
		return createNativeMachineStop("pthread-suspended", {
			operation: "pthread_mutex_lock",
			owner: error.owner,
			result: 0,
			suspension: Object.freeze({
				mutex: address.toString(),
				owner: error.owner,
				thread: current.toString(),
				type: "mutex"
			})
		});
	}
}

function unlock(context, mutexes, scheduler) {
	const address = argument(context, 0);
	const evidence = mutexes.unlock(address, thread(context));
	const resumed = evidence.result === 0 && !evidence.locked && scheduler
		? scheduler.wakeMutex(address)
		: Object.freeze([]);
	return finish(context, Object.freeze({ ...evidence, resumed }));
}

function initialize(context, mutexes, attributes) {
	const address = argument(context, 0);
	const pointer = argument(context, 1);
	const configuration = attributes ? attributes.resolve(pointer) : legacyResolve(pointer);
	if (!configuration) return finish(context, Object.freeze({ result: EINVAL }));
	return finish(context, mutexes.initialize(address, configuration.type));
}

function normalizeOptions(options) {
	if (options?.mutexes) return options;
	return Object.freeze({ attributes: null, mutexes: options, scheduler: null });
}

function legacyResolve(pointer) {
	return pointer === 0n ? Object.freeze({ type: 0 }) : null;
}

function queueError(address, threadValue) {
	const error = new Error(`NATIVE_PTHREAD_MUTEX_QUEUE:${address}:${threadValue}`);
	error.code = "NATIVE_PTHREAD_MUTEX_QUEUE";
	return error;
}

function thread(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}
function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}
function finish(context, evidence) {
	context.registers.write(0, BigInt(evidence.result), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return evidence;
}
