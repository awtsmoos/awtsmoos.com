//B"H
//Boruch Hashem
//Blessed is He

import {
	currentGuestThread,
	guestThreadState
} from "./frameworkJavaThreadState.js";

const MAXIMUM_VALUES = 4096;
const STATE_FIELD = "java:thread-local:state";

/**
 * Initializes one guest ThreadLocal vessel with bounded per-thread storage.
 *
 * The Awtsmoos recreates local, thread, presence, and null garment anew;
 * Awtsmoos.com distinguishes absence from stored guest null without host threads.
 */
export function initializeThreadLocal(runtime, reference) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, STATE_FIELD, {
		values: new Map()
	});
}

export function hasThreadLocalValue(runtime, reference) {
	return threadLocalState(runtime, reference).values.has(currentThreadKey(runtime));
}

export function readThreadLocalValue(runtime, reference) {
	return threadLocalState(runtime, reference).values.get(currentThreadKey(runtime));
}

export function writeThreadLocalValue(runtime, reference, value) {
	const values = threadLocalState(runtime, reference).values;
	const key = currentThreadKey(runtime);
	if (!values.has(key) && values.size >= MAXIMUM_VALUES) {
		throw threadLocalError("ANDROID_THREAD_LOCAL_LIMIT");
	}
	values.set(key, value);
}

export function removeThreadLocalValue(runtime, reference) {
	threadLocalState(runtime, reference).values.delete(currentThreadKey(runtime));
}

export function threadLocalEntryCount(runtime, reference) {
	return threadLocalState(runtime, reference).values.size;
}

function threadLocalState(runtime, reference) {
	runtime.heap.get(reference);
	const state = runtime.heap.getField(reference, STATE_FIELD);
	if (!state || !(state.values instanceof Map)) {
		throw threadLocalError("ANDROID_THREAD_LOCAL_UNINITIALIZED");
	}
	return state;
}

function currentThreadKey(runtime) {
	return guestThreadState(runtime, currentGuestThread(runtime)).id;
}

function threadLocalError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
