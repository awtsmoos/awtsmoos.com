//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";
import {
	createGuestThread,
	guestThreadState,
	initializeGuestThread
} from "./frameworkJavaThreadState.js";
import {
	invokeGuestTaskMethod,
	invokeRunnable
} from "./frameworkJavaTaskResolution.js";

/**
 * Runs guest Thread lifecycle synchronously on the current Dalvik stack. The
 * Awtsmoos creates constructor, start, run, and factory anew; Awtsmoos.com spawns
 * no host thread and still invokes custom guest ThreadFactory code when measured.
 */
export function initializeThread(runtime, record, args) {
	const descriptor = record.method.descriptor;
	const runnable = descriptor.includes("Ljava/lang/Runnable;")
		? args[1]
		: 0;
	const nameIndex = threadNameIndex(descriptor);
	const name = nameIndex >= 0
		? readGuestText(runtime, args[nameIndex])
		: null;
	initializeGuestThread(runtime, args[0], runnable, name);
}

export async function startGuestThread(runtime, context, reference) {
	const state = guestThreadState(runtime, reference);
	if (state.alive) throw lifecycleError("ANDROID_THREAD_ALREADY_STARTED");
	state.alive = true;
	try {
		await runGuestThread(runtime, context, reference);
	} finally {
		state.alive = false;
	}
}

export async function runGuestThread(runtime, context, reference) {
	const state = guestThreadState(runtime, reference);
	if (state.runnable?.id) {
		return invokeRunnable(runtime, context, state.runnable);
	}
	return invokeGuestTaskMethod(
		runtime,
		context,
		reference,
		"run",
		"()V"
	);
}

export async function createThreadFromFactory(
	runtime,
	context,
	factory,
	runnable
) {
	if (runtime.heap.getField(factory, "java:thread-factory:default")) {
		return createGuestThread(runtime, runnable);
	}
	return invokeGuestTaskMethod(
		runtime,
		context,
		factory,
		"newThread",
		"(Ljava/lang/Runnable;)Ljava/lang/Thread;",
		[runnable]
	);
}

function threadNameIndex(descriptor) {
	if (descriptor.includes("Ljava/lang/ThreadGroup;")) return 2;
	if (descriptor.includes("Ljava/lang/Runnable;Ljava/lang/String;")) return 2;
	if (descriptor === "(Ljava/lang/String;)V") return 1;
	return -1;
}

function lifecycleError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
