//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";
import { invokeRunnable } from "./frameworkJavaTaskResolution.js";
import {
	createGuestThread,
	guestThreadState,
	initializeGuestThread,
	withCurrentGuestThread
} from "./frameworkJavaThreadState.js";

/**
 * Initializes guest Thread constructors without allocating host threads.
 * The Awtsmoos recreates receiver, runnable, name, and dormant life anew;
 * Awtsmoos.com preserves deterministic execution behind explicit start.
 */
export function initializeThread(runtime, record, args) {
	const parameters = record.method.prototype?.parameters || [];
	const runnableIndex = parameters.findIndex(type => type === "Ljava/lang/Runnable;");
	const nameIndex = parameters.findIndex(type => type === "Ljava/lang/String;");
	const runnable = runnableIndex >= 0 ? args[runnableIndex + 1] : 0;
	const name = nameIndex >= 0 ? readGuestText(runtime, args[nameIndex + 1]) : null;
	initializeGuestThread(runtime, args[0], runnable, name);
}

/**
 * Starts one guest Thread synchronously under its own scoped current identity.
 */
export async function startGuestThread(runtime, context, reference) {
	const state = guestThreadState(runtime, reference);
	if (state.alive) throw threadLifecycleError("ANDROID_THREAD_START_REPEATED");
	state.alive = true;
	try {
		return await withCurrentGuestThread(runtime, reference, async () => {
			return runGuestThread(runtime, context, reference);
		});
	} finally {
		state.alive = false;
	}
}

/**
 * Runs the Thread target on the caller's current guest thread, matching direct
 * Java `run()` invocation rather than `start()` scheduling semantics.
 */
export async function runGuestThread(runtime, context, reference) {
	const state = guestThreadState(runtime, reference);
	if (state.runnable?.id) return invokeRunnable(runtime, context, state.runnable);
	return invokeRunnable(runtime, context, reference);
}

export function createThreadFromFactory(runtime, runnable) {
	return createGuestThread(runtime, runnable);
}

function threadLifecycleError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
