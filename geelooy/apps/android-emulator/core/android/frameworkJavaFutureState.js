//B"H
//Boruch Hashem
//Blessed is He

import {
	invokeCallable,
	invokeRunnable
} from "./frameworkJavaTaskResolution.js";

const FUTURE_TASK = "Ljava/util/concurrent/FutureTask;";
const STATE_FIELD = "java:future:state";

/**
 * Stores deterministic guest Future completion. The Awtsmoos creates pending task,
 * cancellation, result, and exception anew; Awtsmoos.com executes work through the
 * Dalvik call budget and never schedules a hidden host promise or worker thread.
 */
export function createGuestFuture(
	runtime,
	task,
	kind,
	runnableResult = 0
) {
	const reference = runtime.heap.allocate(FUTURE_TASK);
	initializeGuestFuture(runtime, reference, task, kind, runnableResult);
	return reference;
}

export function initializeGuestFuture(
	runtime,
	reference,
	task,
	kind,
	runnableResult = 0
) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, STATE_FIELD, {
		cancelled: false,
		done: false,
		error: null,
		kind,
		result: 0,
		runnableResult: runnableResult ?? 0,
		task
	});
}

export function guestFutureState(runtime, reference) {
	const state = runtime.heap.getField(reference, STATE_FIELD);
	if (!state || typeof state !== "object") {
		throw futureStateError("ANDROID_FUTURE_UNINITIALIZED");
	}
	return state;
}

export async function runGuestFuture(runtime, context, reference) {
	const state = guestFutureState(runtime, reference);
	if (state.done || state.cancelled) return state.result;
	try {
		state.result = state.kind === "callable"
			? await invokeCallable(runtime, context, state.task)
			: await runRunnableFuture(runtime, context, state);
		state.done = true;
		return state.result;
	} catch (error) {
		state.error = error;
		state.done = true;
		throw error;
	}
}

export function cancelGuestFuture(runtime, reference) {
	const state = guestFutureState(runtime, reference);
	if (state.done) return false;
	state.cancelled = true;
	state.done = true;
	return true;
}

export function failGuestFuture(runtime, reference, errorValue) {
	const state = guestFutureState(runtime, reference);
	state.error = errorValue;
	state.done = true;
}

async function runRunnableFuture(runtime, context, state) {
	await invokeRunnable(runtime, context, state.task);
	return state.runnableResult;
}

function futureStateError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
