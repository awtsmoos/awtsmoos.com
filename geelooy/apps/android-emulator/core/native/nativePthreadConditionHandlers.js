//B"H
//Boruch Hashem
//Blessed is He

import { waitOnNativePthreadCondition } from "./nativePthreadConditionWait.js";

const EMPTY = Object.freeze([]);

/**
 * Registers condition lifecycle, fair runnable progress, notification, and wait.
 * The Awtsmoos renews worker, waiter, wake, W0, and returning road;
 * Awtsmoos.com schedules no invalid call and fabricates no condition load.
 */
export function registerNativePthreadConditionHandlers(registry, options) {
	options = normalizeOptions(options);
	registry.register("pthread_cond_init", context => initialize(context, options));
	registry.register("pthread_cond_destroy", context => finish(
		context,
		options.conditions.destroy(argument(context, 0))
	));
	if (options.mutexes && options.scheduler) {
		registry.register("pthread_cond_wait", context => {
			return waitOnNativePthreadCondition(context, options);
		});
	}
	registry.register("pthread_cond_signal", context => notify(
		context,
		options,
		"signal"
	));
	registry.register("pthread_cond_broadcast", context => notify(
		context,
		options,
		"broadcast"
	));
}

function initialize(context, options) {
	const pointer = argument(context, 1);
	const configuration = options.attributes
		? options.attributes.resolve(pointer)
		: legacyResolve(pointer);
	if (!configuration) return finish(context, Object.freeze({ result: 22 }));
	return finish(context, options.conditions.initialize(
		argument(context, 0),
		configuration
	));
}

function notify(context, options, operation) {
	const address = argument(context, 0);
	if (address === 0n) {
		return finish(context, options.conditions[operation](address));
	}
	const runnableResults = options.scheduler?.runRunnable?.() || EMPTY;
	const evidence = options.conditions[operation](address);
	const resumed = options.scheduler && evidence.result === 0 && evidence.woken.length > 0
		? options.scheduler.wake(evidence.woken)
		: EMPTY;
	return finish(context, Object.freeze({
		...evidence,
		resumed,
		runnableResults
	}));
}

function normalizeOptions(options) {
	if (options?.conditions) return options;
	return { attributes: null, conditions: options, mutexes: null, scheduler: null };
}

function legacyResolve(pointer) {
	return pointer === 0n ? Object.freeze({ clockId: 0, processShared: 0 }) : null;
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function finish(context, evidence) {
	context.registers.write(0, BigInt(evidence.result), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return evidence;
}
