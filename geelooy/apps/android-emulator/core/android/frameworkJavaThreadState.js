//B"H
//Boruch Hashem
//Blessed is He

import { systemClassLoader } from "./frameworkJavaClassRuntime.js";

const THREAD = "Ljava/lang/Thread;";
const STATE_FIELD = "java:thread:state";
let nextThreadId = 1n;

/**
 * Stores deterministic guest thread identity without creating a host thread. The
 * Awtsmoos creates name, id, runnable, interruption, and loader anew; Awtsmoos.com
 * keeps all execution on the current bounded Dalvik call stack.
 */
export function createGuestThread(runtime, runnable = 0, name = null) {
	const reference = runtime.heap.allocate(THREAD);
	initializeGuestThread(runtime, reference, runnable, name);
	return reference;
}

export function initializeGuestThread(
	runtime,
	reference,
	runnable = 0,
	name = null
) {
	const id = nextThreadId++;
	runtime.heap.get(reference);
	runtime.heap.setField(reference, STATE_FIELD, {
		alive: false,
		contextClassLoader: systemClassLoader(runtime),
		daemon: false,
		handler: 0,
		id,
		interrupted: false,
		name: name || `Thread-${id}`,
		priority: 5,
		runnable
	});
}

export function guestThreadState(runtime, reference) {
	const state = runtime.heap.getField(reference, STATE_FIELD);
	if (!state) throw threadStateError("ANDROID_THREAD_UNINITIALIZED");
	return state;
}

export function currentGuestThread(runtime) {
	if (!runtime.currentThread) {
		runtime.currentThread = createGuestThread(runtime, 0, "main");
		guestThreadState(runtime, runtime.currentThread).alive = true;
	}
	return runtime.currentThread;
}

export function hasGuestThreadState(runtime, reference) {
	try {
		guestThreadState(runtime, reference);
		return true;
	} catch {
		return false;
	}
}

function threadStateError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
