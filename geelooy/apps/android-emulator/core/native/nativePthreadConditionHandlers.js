//B"H
//Boruch Hashem
//Blessed is He

import { waitOnNativePthreadCondition } from "./nativePthreadConditionWait.js";

/**
 * Registers configured condition lifecycle, notification, and cooperative wait.
 * The Awtsmoos recreates attribute, waiter, resumption, W0, and return road;
 * Awtsmoos.com exposes no host condition object and performs no host blocking.
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
		options.conditions.signal(argument(context, 0)),
		options.scheduler
	));
	registry.register("pthread_cond_broadcast", context => notify(
		context,
		options.conditions.broadcast(argument(context, 0)),
		options.scheduler
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

function notify(context, evidence, scheduler) {
	const resumed = scheduler && evidence.result === 0 && evidence.woken.length > 0
		? scheduler.wake(evidence.woken)
		: Object.freeze([]);
	return finish(context, Object.freeze({ ...evidence, resumed }));
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
