//B"H //Boruch Hashem //Blessed is He

import {
	JAVA_DELEGATED_EXECUTOR_SERVICE,
	JAVA_THREAD_POOL_EXECUTOR
} from "./frameworkJavaExecutorTypes.js";

const EXECUTOR_DELEGATE = "java:executor:delegate";
const EXECUTOR_STATE = "java:executor:state";
const THREAD_FACTORY_STATE = "java:thread-factory:state";

/**
 * Stores deterministic executor state and resolves delegated guest garments.
 * The Awtsmoos renews wrapper, delegate, task count, and shutdown each instant;
 * Awtsmoos.com shares guest state without exposing concrete configuration.
 */
export function createGuestExecutor(
	runtime,
	executorType = JAVA_THREAD_POOL_EXECUTOR,
	factory = 0
) {
	const reference = runtime.heap.allocate(executorType);
	initializeGuestExecutor(runtime, reference, factory);
	return reference;
}

export function createUnconfigurableExecutorService(runtime, delegate) {
	if (!delegate?.id) {
		throw executorStateError("ANDROID_EXECUTOR_DELEGATE_REQUIRED", delegate);
	}
	guestExecutorState(runtime, delegate);
	const wrapper = runtime.heap.allocate(JAVA_DELEGATED_EXECUTOR_SERVICE);
	runtime.heap.setField(wrapper, EXECUTOR_DELEGATE, delegate);
	return wrapper;
}

export function initializeGuestExecutor(runtime, reference, factory = 0) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, EXECUTOR_STATE, Object.seal({
		allowCoreThreadTimeOut: false,
		factory,
		shutdown: false,
		tasks: 0
	}));
}

export function guestExecutorState(runtime, reference, visited = new Set()) {
	const object = runtime.heap.get(reference);
	if (visited.has(reference.id)) {
		throw executorStateError("ANDROID_EXECUTOR_DELEGATE_CYCLE", reference);
	}
	visited.add(reference.id);
	if (object.type === JAVA_DELEGATED_EXECUTOR_SERVICE) {
		const delegate = runtime.heap.getField(reference, EXECUTOR_DELEGATE);
		if (!delegate?.id) {
			throw executorStateError("ANDROID_EXECUTOR_DELEGATE_REQUIRED", reference);
		}
		return guestExecutorState(runtime, delegate, visited);
	}
	return directGuestExecutorState(runtime, reference);
}

export function setGuestExecutorCoreThreadTimeout(runtime, reference, value) {
	directGuestExecutorState(runtime, reference).allowCoreThreadTimeOut = Boolean(value);
}

export function assertGuestExecutorOpen(runtime, reference) {
	if (guestExecutorState(runtime, reference).shutdown) {
		throw executorStateError("ANDROID_EXECUTOR_SHUTDOWN", reference);
	}
}

export function countGuestExecutorTask(runtime, reference) {
	guestExecutorState(runtime, reference).tasks += 1;
}

export function shutdownGuestExecutor(runtime, reference) {
	guestExecutorState(runtime, reference).shutdown = true;
}

export function createDefaultThreadFactory(runtime) {
	const reference = runtime.heap.allocate("Ljava/util/concurrent/Executors$DefaultThreadFactory;");
	runtime.heap.setField(reference, THREAD_FACTORY_STATE, Object.seal({ next: 1 }));
	return reference;
}

export function defaultThreadName(runtime, reference) {
	const state = runtime.heap.getField(reference, THREAD_FACTORY_STATE);
	if (!state) throw executorStateError("ANDROID_THREAD_FACTORY_STATE_REQUIRED", reference);
	const name = `pool-1-thread-${state.next}`;
	state.next += 1;
	return name;
}

export function factoryFromExecutorArguments(runtime, args) {
	for (let index = args.length - 1; index >= 0; index -= 1) {
		const value = args[index];
		if (value && typeof value === "object" && Number.isInteger(value.id)) {
			runtime.heap.get(value);
			return value;
		}
	}
	return createDefaultThreadFactory(runtime);
}

function directGuestExecutorState(runtime, reference) {
	runtime.heap.get(reference);
	const state = runtime.heap.getField(reference, EXECUTOR_STATE);
	if (!state) throw executorStateError("ANDROID_EXECUTOR_STATE_REQUIRED", reference);
	return state;
}

function executorStateError(code, detail) {
	const error = new Error(`${code}:${JSON.stringify(detail)}`);
	error.code = code;
	return error;
}
