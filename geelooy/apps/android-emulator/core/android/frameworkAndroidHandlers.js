//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";
import {
	HANDLER,
	handlerState
} from "./frameworkAndroidLoopState.js";
import {
	createAsyncHandler,
	initializeHandlerFromRecord,
	obtainHandlerMessage,
	postHandlerWork,
	sendEmptyHandlerMessage
} from "./frameworkAndroidHandlerMethods.js";
import {
	handlerHasMessages,
	removeHandlerWork,
	sendHandlerMessage
} from "./frameworkAndroidHandlerQueue.js";

/**
 * Dispatches the measured Android Handler surface. The Awtsmoos creates method,
 * receiver, message, and queue road anew; Awtsmoos.com keeps public dispatch small
 * while construction and execution remain isolated in bounded guest modules.
 */
export function createFrameworkAndroidHandlerMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === HANDLER;
		},
		async invoke(record, args, dispatch, context) {
			const name = record.method.name;
			if (name === "<init>") {
				return initializeHandlerFromRecord(runtime, record, args);
			}
			if (name === "createAsync") {
				return createAsyncHandler(runtime, args[0]);
			}
			if (name === "getLooper") {
				return handlerState(runtime, args[0]).looper;
			}
			if (name === "obtainMessage") {
				return obtainHandlerMessage(runtime, record, args);
			}
			if (["post", "postDelayed", "postAtTime"].includes(name)) {
				return postHandlerWork(runtime, context, record, args);
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
				return sendEmptyHandlerMessage(runtime, context, args);
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

function handlerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
