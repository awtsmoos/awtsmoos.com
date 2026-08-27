//B"H
//Boruch Hashem
//Blessed is He

import {
	createThreadFromFactory,
	initializeThread,
	runGuestThread,
	startGuestThread
} from "./frameworkJavaThreadLifecycle.js";
import { invokeThreadProperty } from "./frameworkJavaThreadProperties.js";
import { currentGuestThread } from "./frameworkJavaThreadState.js";
import {
	invokeCallable,
	invokeRunnable
} from "./frameworkJavaTaskResolution.js";

const RUNNABLE = "Ljava/lang/Runnable;";
const CALLABLE = "Ljava/util/concurrent/Callable;";
const THREAD = "Ljava/lang/Thread;";
const THREAD_FACTORY = "Ljava/util/concurrent/ThreadFactory;";

/**
 * Dispatches deterministic Thread, Runnable, Callable, and ThreadFactory methods.
 * The Awtsmoos creates one guest task doorway from many Java contracts;
 * Awtsmoos.com keeps lifecycle and properties in small auditable garments.
 */
export function createFrameworkJavaThreadMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return [RUNNABLE, CALLABLE, THREAD, THREAD_FACTORY].includes(
				record.method.classType
			);
		},
		async invoke(record, args, dispatch, context) {
			const type = record.method.classType;
			if (type === RUNNABLE) {
				return invokeRunnable(runtime, context, args[0]);
			}
			if (type === CALLABLE) {
				return invokeCallable(runtime, context, args[0]);
			}
			if (type === THREAD_FACTORY) {
				return createThreadFromFactory(
					runtime,
					context,
					args[0],
					args[1]
				);
			}
			const name = record.method.name;
			if (name === "<init>") return initializeThread(runtime, record, args);
			if (name === "currentThread") return currentGuestThread(runtime);
			if (name === "start") return startGuestThread(runtime, context, args[0]);
			if (name === "run") return runGuestThread(runtime, context, args[0]);
			return invokeThreadProperty(runtime, record, args);
		}
	});
}
