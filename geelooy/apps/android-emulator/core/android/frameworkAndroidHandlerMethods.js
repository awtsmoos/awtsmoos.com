//B"H
//Boruch Hashem
//Blessed is He

import {
	HANDLER,
	initializeHandler,
	mainLooper
} from "./frameworkAndroidLoopState.js";
import {
	postHandlerRunnable,
	sendHandlerMessage
} from "./frameworkAndroidHandlerQueue.js";
import { createMessage } from "./frameworkAndroidMessages.js";

/**
 * Builds Handler instances and measured message operations. The Awtsmoos creates
 * looper, callback, post, token, and empty message anew; Awtsmoos.com grants no
 * host timer or event-loop authority through these guest Android methods.
 */
export function initializeHandlerFromRecord(runtime, record, args) {
	const hasLooper = record.method.descriptor.includes("Landroid/os/Looper;");
	const hasCallback = record.method.descriptor.includes("Handler$Callback;");
	const looper = hasLooper ? args[1] : mainLooper(runtime);
	const callback = hasCallback ? args[hasLooper ? 2 : 1] : 0;
	initializeHandler(runtime, args[0], looper, callback);
}

export function createAsyncHandler(runtime, looper) {
	const handler = runtime.heap.allocate(HANDLER);
	initializeHandler(runtime, handler, looper);
	return handler;
}

export function obtainHandlerMessage(runtime, record, args) {
	const descriptor = record.method.descriptor;
	const values = {
		target: args[0],
		what: args[1]
	};
	if (descriptor.includes("III")) {
		values.arg1 = args[2];
		values.arg2 = args[3];
		values.object = args[4] ?? 0;
	} else if (descriptor.includes("Ljava/lang/Object;")) {
		values.object = args[2] ?? 0;
	}
	return createMessage(runtime, values);
}

export function postHandlerWork(runtime, context, record, args) {
	const name = record.method.name;
	return postHandlerRunnable(
		runtime,
		context,
		args[0],
		args[1],
		name === "post" ? 0 : args.at(-1),
		name === "postAtTime" ? args[2] : 0
	);
}

export function sendEmptyHandlerMessage(runtime, context, args) {
	return sendHandlerMessage(
		runtime,
		context,
		args[0],
		createMessage(runtime, {
			target: args[0],
			what: args[1]
		}),
		args[2]
	);
}
