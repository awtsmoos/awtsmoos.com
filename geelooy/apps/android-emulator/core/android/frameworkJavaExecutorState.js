//B"H
//Boruch Hashem
//Blessed is He

const STATE_FIELD = "java:executor:state";
const THREAD_POOL = "Ljava/util/concurrent/ThreadPoolExecutor;";
const THREAD_FACTORY = "Ljava/util/concurrent/ThreadFactory;";

/**
 * Stores deterministic guest executor identity and shutdown state. The Awtsmoos
 * creates pool, factory, task count, and rejection boundary anew; Awtsmoos.com
 * allocates no host worker, timer, queue, or thread through this vessel.
 */
export function createGuestExecutor(runtime, factory = 0) {
	const reference = runtime.heap.allocate(THREAD_POOL);
	initializeGuestExecutor(runtime, reference, factory);
	return reference;
}

export function initializeGuestExecutor(runtime, reference, factory = 0) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, STATE_FIELD, {
		factory,
		shutdown: false,
		taskCount: 0
	});
}

export function guestExecutorState(runtime, reference) {
	const state = runtime.heap.getField(reference, STATE_FIELD);
	if (!state) throw executorStateError("ANDROID_EXECUTOR_UNINITIALIZED");
	return state;
}

export function assertGuestExecutorOpen(runtime, reference) {
	if (guestExecutorState(runtime, reference).shutdown) {
		throw executorStateError("ANDROID_EXECUTOR_REJECTED");
	}
}

export function countGuestExecutorTask(runtime, reference) {
	guestExecutorState(runtime, reference).taskCount += 1;
}

export function shutdownGuestExecutor(runtime, reference) {
	guestExecutorState(runtime, reference).shutdown = true;
}

export function createDefaultThreadFactory(runtime) {
	return runtime.heap.allocate(THREAD_FACTORY, {
		"java:thread-factory:default": true
	});
}

export function factoryFromExecutorArguments(runtime, record, args) {
	if (!record.method.descriptor.includes("ThreadFactory;")) return 0;
	for (let index = args.length - 1; index >= 0; index -= 1) {
		const value = args[index];
		if (value?.id) return value;
	}
	return 0;
}

function executorStateError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
