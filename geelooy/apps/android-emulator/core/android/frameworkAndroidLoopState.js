//B"H
//Boruch Hashem
//Blessed is He

import { currentGuestThread } from "./frameworkJavaThreadState.js";

export const HANDLER = "Landroid/os/Handler;";
export const LOOPER = "Landroid/os/Looper;";
export const MESSAGE = "Landroid/os/Message;";
const HANDLER_STATE = "android:handler:state";
const LOOPER_STATE = "android:looper:state";
const MESSAGE_STATE = "android:message:state";

/**
 * Stores one deterministic Android main queue. The Awtsmoos creates looper,
 * handler, message, FIFO entry, and drain boundary anew; Awtsmoos.com records
 * delay metadata but never sleeps, schedules, or blocks a host execution lane.
 */
export function mainLooper(runtime) {
	if (runtime.mainLooper) return runtime.mainLooper;
	const looper = runtime.heap.allocate(LOOPER);
	runtime.heap.setField(looper, LOOPER_STATE, {
		draining: false,
		queue: [],
		thread: currentGuestThread(runtime)
	});
	runtime.mainLooper = looper;
	return looper;
}

export function looperState(runtime, reference) {
	const state = runtime.heap.getField(reference, LOOPER_STATE);
	if (!state) throw loopStateError("ANDROID_LOOPER_UNINITIALIZED");
	return state;
}

export function initializeHandler(runtime, reference, looper, callback = 0) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, HANDLER_STATE, {
		callback: callback ?? 0,
		looper: looper?.id ? looper : mainLooper(runtime)
	});
}

export function handlerState(runtime, reference) {
	const state = runtime.heap.getField(reference, HANDLER_STATE);
	if (!state) throw loopStateError("ANDROID_HANDLER_UNINITIALIZED");
	return state;
}

export function initializeMessage(runtime, reference, values = {}) {
	runtime.heap.get(reference);
	const state = {
		data: values.data ?? 0,
		target: values.target ?? 0,
		token: values.token ?? 0
	};
	runtime.heap.setField(reference, MESSAGE_STATE, state);
	setMessageField(runtime, reference, "what", values.what ?? 0, "I");
	setMessageField(runtime, reference, "arg1", values.arg1 ?? 0, "I");
	setMessageField(runtime, reference, "arg2", values.arg2 ?? 0, "I");
	setMessageField(
		runtime,
		reference,
		"obj",
		values.object ?? 0,
		"Ljava/lang/Object;"
	);
	return state;
}

export function messageState(runtime, reference) {
	const state = runtime.heap.getField(reference, MESSAGE_STATE);
	if (!state) return initializeMessage(runtime, reference);
	return state;
}

export function messageField(runtime, reference, name, type) {
	return runtime.heap.getField(reference, `${MESSAGE}->${name}:${type}`) ?? 0;
}

export function setMessageField(runtime, reference, name, value, type) {
	runtime.heap.setField(reference, `${MESSAGE}->${name}:${type}`, value ?? 0);
}

export function enqueueLooperWork(runtime, looper, entry) {
	looperState(runtime, looper).queue.push(Object.freeze(entry));
}

export function removeLooperWork(runtime, looper, predicate) {
	const state = looperState(runtime, looper);
	state.queue = state.queue.filter(entry => !predicate(entry));
}

export function hasLooperWork(runtime, looper, predicate) {
	return looperState(runtime, looper).queue.some(predicate);
}

export async function drainLooper(runtime, looper, execute) {
	const state = looperState(runtime, looper);
	if (state.draining) return;
	state.draining = true;
	try {
		while (state.queue.length) await execute(state.queue.shift());
	} finally {
		state.draining = false;
	}
}

function loopStateError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
