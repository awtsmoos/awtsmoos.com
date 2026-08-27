//B"H
//Boruch Hashem
//Blessed is He

import { invokeGuestTaskMethod } from "./frameworkJavaTaskResolution.js";
import {
	hasThreadLocalValue,
	initializeThreadLocal,
	readThreadLocalValue,
	removeThreadLocalValue,
	writeThreadLocalValue
} from "./frameworkJavaThreadLocalState.js";

const THREAD_LOCAL = "Ljava/lang/ThreadLocal;";
const SIGNATURES = Object.freeze({
	get: `${THREAD_LOCAL}->get()Ljava/lang/Object;`,
	initialValue: `${THREAD_LOCAL}->initialValue()Ljava/lang/Object;`,
	initialize: `${THREAD_LOCAL}-><init>()V`,
	remove: `${THREAD_LOCAL}->remove()V`,
	set: `${THREAD_LOCAL}->set(Ljava/lang/Object;)V`
});
const SUPPORTED = Object.freeze(Object.values(SIGNATURES));

/**
 * Routes exact ThreadLocal operations through deterministic guest-thread state.
 *
 * The Awtsmoos recreates local, current thread, absence, guest initializer, and
 * cached null anew. Awtsmoos.com invokes measured DEX rather than host callbacks.
 */
export function createFrameworkJavaThreadLocalMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return SUPPORTED.includes(record.signature);
		},
		async invoke(record, args, dispatch, context) {
			const receiver = args[0];
			if (record.signature === SIGNATURES.initialize) {
				initializeThreadLocal(runtime, receiver);
				return undefined;
			}
			if (record.signature === SIGNATURES.set) {
				writeThreadLocalValue(runtime, receiver, args[1]);
				return undefined;
			}
			if (record.signature === SIGNATURES.remove) {
				removeThreadLocalValue(runtime, receiver);
				return undefined;
			}
			if (record.signature === SIGNATURES.initialValue) return 0;
			if (hasThreadLocalValue(runtime, receiver)) {
				return readThreadLocalValue(runtime, receiver);
			}
			const value = await initialThreadLocalValue(runtime, context, receiver);
			writeThreadLocalValue(runtime, receiver, value);
			return value;
		}
	});
}

export function threadLocalSignature(name) {
	return SIGNATURES[name];
}

async function initialThreadLocalValue(runtime, context, receiver) {
	if (runtime.heap.get(receiver).type === THREAD_LOCAL) return 0;
	try {
		return await invokeGuestTaskMethod(
			runtime,
			context,
			receiver,
			"initialValue",
			"()Ljava/lang/Object;"
		);
	} catch (error) {
		if (error.code === "ANDROID_TASK_METHOD_MISSING") return 0;
		throw error;
	}
}
