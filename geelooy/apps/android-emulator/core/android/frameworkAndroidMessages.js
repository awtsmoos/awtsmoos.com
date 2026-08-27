//B"H
//Boruch Hashem
//Blessed is He

import { initializeBundle } from "./frameworkBundleStorage.js";
import {
	initializeMessage,
	MESSAGE,
	messageState
} from "./frameworkAndroidLoopState.js";

/**
 * Implements measured Android Message creation, Bundle data, and target delivery.
 * The Awtsmoos creates what, arguments, object, target, and saved data anew;
 * Awtsmoos.com keeps every message inside the bounded guest main queue.
 */
export function createFrameworkAndroidMessageMethods(runtime, sendMessage) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === MESSAGE;
		},
		async invoke(record, args, dispatch, context) {
			const name = record.method.name;
			if (name === "obtain") return obtainMessage(runtime, record, args);
			if (name === "getData") return getMessageData(runtime, args[0]);
			if (name === "setData") {
				messageState(runtime, args[0]).data = args[1] ?? 0;
				return undefined;
			}
			if (name === "sendToTarget") {
				const target = messageState(runtime, args[0]).target;
				if (!target?.id) throw messageError("ANDROID_MESSAGE_TARGET_MISSING");
				await sendMessage(runtime, context, target, args[0], 0);
				return undefined;
			}
			throw messageError(
				"ANDROID_MESSAGE_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

export function createMessage(runtime, values = {}) {
	const reference = runtime.heap.allocate(MESSAGE);
	initializeMessage(runtime, reference, values);
	return reference;
}

function obtainMessage(runtime, record, args) {
	const descriptor = record.method.descriptor;
	if (descriptor === "()Landroid/os/Message;") return createMessage(runtime);
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

function getMessageData(runtime, reference) {
	const state = messageState(runtime, reference);
	if (!state.data?.id) {
		state.data = runtime.heap.allocate("Landroid/os/Bundle;");
		initializeBundle(runtime, state.data);
	}
	return state.data;
}

function messageError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
