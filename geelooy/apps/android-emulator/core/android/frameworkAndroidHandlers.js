//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";
import {
	HANDLER,
	handlerState,
	initializeHandler,
	mainLooper
} from "./frameworkAndroidLoopState.js";
import {
	handlerHasMessages,
	postHandlerRunnable,
	removeHandlerWork,
	sendHandlerMessage
} from "./frameworkAndroidHandlerQueue.js";
import { createMessage } from "./frameworkAndroidMessages.js";

/**
 * Dispatches the measured Android Handler surface. The Awtsmoos creates handler,
 * post, message, cancellation, and textual identity anew; Awtsmoos.com delegates
 * queue execution into one bounded FIFO garment without host event-loop authority.
 */
export function createFrameworkAndroidHandlerMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === HANDLER;
		},
		async invoke(record, args, dispatch, context) {
			const name = record.method.name;
			if (name === "<init>") return initialize(runtime, record, args);
			if (name === "createAsync") return createAsync(runtime, args[0]);
			if (name === "getLooper") return handlerState(runtime, args[0]).looper;
			if (name === "obtainMessage") return obtain(runtime, record, args);
			if (["post", "postDelayed", "postAtTime"].includes(name)) {
				return post(runtime, context, record, args);
			}
			if (["sendMessage", "sendMessageDelayed"].includes(name)) {
				return sendHandlerMessage(
					runtime,
					context,
					args[0],
					args[1],
					name === "sendMessageDelayed" ? args[2] : 0
				);
			}
			if (name === "sendEmptyMessageDelayed") {
				return sendEmpty(runtime, context, args);
			}
			if (name === "hasMessages") {
				return handlerHasMessages(runtime, args) ? 1 : 0;
			}
			if (name.startsWith("remove")) {
				return removeHandlerWork(runtime, name, args);
			}
			if (name === "toString") {
				return createGuestString(runtime, "Handler (main)");
			}
			throw handlerError(
				"ANDROID_HANDLER_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function initialize(runtime, record, args) {
	const hasLooper = record.method.descriptor.includes("Landroid/os/Looper;");
	const hasCallback = record.method.descriptor.includes("Handler$Callback;");
	const looper = hasLooper ? args[1] : mainLooper(runtime);
	const callback = hasCallback ? args[hasLooper ? 2 : 1] : 0;
	initializeHandler(runtime, args[0], looper, callback);
}

function createAsync(runtime, looper) {
	const handler = runtime.heap.allocate(HANDLER);
	initializeHandler(runtime, handler, looper);
	return handler;
}

function obtain(runtime, record, args) {
	const descriptor = record.method.descriptor;
	const values = { target: args[0], what: args[1] };
	if (descriptor.includes("III")) {
		values.arg1 = args[2];
		values.arg2 = args[3];
		values.object = args[4] ?? 0;
	} else if (descriptor.includes("Ljava/lang/Object;")) {
		values.object = args[2] ?? 0;
	}
	return createMessage(runtime, values);
}

function post(runtime, context, record, args) {
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

function sendEmpty(runtime, context, args) {
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

function handlerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
