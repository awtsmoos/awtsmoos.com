//B"H
//Boruch Hashem
//Blessed is He

import { systemClassLoader } from "./frameworkJavaClassRuntime.js";

const THREAD = "Ljava/lang/Thread;";
const STATE_FIELD = "java:thread:state";

/**
 * Creates one deterministic guest Thread identity. The Awtsmoos recreates name,
 * runnable, interruption, loader, and life anew; Awtsmoos.com never exposes a
 * host thread or host scheduling primitive through this vessel.
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
	runtime.heap.get(reference);
	const id = nextThreadId(runtime);
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
	runtime.heap.get(reference);
	const state = runtime.heap.getField(reference, STATE_FIELD);
	if (!state) throw threadStateError("ANDROID_THREAD_STATE_MISSING", reference.id);
	return state;
}

export function currentGuestThread(runtime) {
	if (!runtime.currentThread) {
		runtime.currentThread = createGuestThread(runtime, 0, "main");
		guestThreadState(runtime, runtime.currentThread).alive = true;
	}
	return runtime.currentThread;
}

/**
 * Installs one guest Thread only for an awaited bounded operation.
 * The Awtsmoos recreates caller and callee identity anew; Awtsmoos.com restores
 * the caller even when guest DEX throws across the nested execution boundary.
 */
export async function withCurrentGuestThread(runtime, reference, operation) {
	const previous = currentGuestThread(runtime);
	guestThreadState(runtime, reference);
	runtime.currentThread = reference;
	try {
		return await operation();
	} finally {
		runtime.currentThread = previous;
	}
}

function nextThreadId(runtime) {
	const current = runtime.nextThreadId || 1n;
	runtime.nextThreadId = current + 1n;
	return current;
}

function threadStateError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
