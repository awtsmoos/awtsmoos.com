//B"H
//Boruch Hashem
//Blessed is He

import {
	drainLooper,
	enqueueLooperWork,
	handlerState,
	hasLooperWork,
	messageField,
	messageState,
	removeLooperWork
} from "./frameworkAndroidLoopState.js";
import {
	invokeGuestTaskMethod,
	invokeRunnable
} from "./frameworkJavaTaskResolution.js";

const CALLBACK_DESCRIPTOR = "(Landroid/os/Message;)Z";
const HANDLE_DESCRIPTOR = "(Landroid/os/Message;)V";

/**
 * Enqueues and drains deterministic Handler work. The Awtsmoos creates FIFO order,
 * runnable, message, callback, and cancellation anew; Awtsmoos.com executes every
 * guest callback inside the existing Dalvik budget and opens no host timer.
 */
export async function sendHandlerMessage(
	runtime,
	context,
	handler,
	message,
	delay = 0
) {
	const state = handlerState(runtime, handler);
	messageState(runtime, message).target = handler;
	enqueueLooperWork(runtime, state.looper, {
		delay: Number(delay || 0),
		handler,
		kind: "message",
		message,
		token: messageState(runtime, message).token
	});
	await drainHandlerQueue(runtime, context, state.looper);
	return 1;
}

export async function postHandlerRunnable(
	runtime,
	context,
	handler,
	runnable,
	delay = 0,
	token = 0
) {
	const state = handlerState(runtime, handler);
	enqueueLooperWork(runtime, state.looper, {
		delay: Number(delay || 0),
		handler,
		kind: "runnable",
		runnable,
		token
	});
	await drainHandlerQueue(runtime, context, state.looper);
	return 1;
}

export function handlerHasMessages(runtime, args) {
	const state = handlerState(runtime, args[0]);
	return hasLooperWork(runtime, state.looper, entry => {
		return entry.kind === "message"
			&& entry.handler?.id === args[0]?.id
			&& messageField(runtime, entry.message, "what", "I")
				=== Number(args[1])
			&& (!args[2] || messageObject(runtime, entry.message) === args[2]);
	});
}

export function removeHandlerWork(runtime, name, args) {
	const state = handlerState(runtime, args[0]);
	removeLooperWork(runtime, state.looper, entry => {
		if (entry.handler?.id !== args[0]?.id) return false;
		if (name === "removeCallbacks") {
			return entry.runnable?.id === args[1]?.id;
		}
		if (name === "removeCallbacksAndMessages") {
			return !args[1] || entry.token === args[1];
		}
		if (name === "removeMessages") {
			return entry.kind === "message"
				&& messageField(runtime, entry.message, "what", "I")
					=== Number(args[1])
				&& (!args[2] || messageObject(runtime, entry.message) === args[2]);
		}
		return false;
	});
}

async function drainHandlerQueue(runtime, context, looper) {
	await drainLooper(runtime, looper, async entry => {
		if (entry.kind === "runnable") {
			await invokeRunnable(runtime, context, entry.runnable);
			return;
		}
		await dispatchMessage(runtime, context, entry.handler, entry.message);
	});
}

async function dispatchMessage(runtime, context, handler, message) {
	const callback = handlerState(runtime, handler).callback;
	if (callback?.id) {
		const handled = await invokeGuestTaskMethod(
			runtime,
			context,
			callback,
			"handleMessage",
			CALLBACK_DESCRIPTOR,
			[message]
		);
		if (handled) return;
	}
	try {
		await invokeGuestTaskMethod(
			runtime,
			context,
			handler,
			"handleMessage",
			HANDLE_DESCRIPTOR,
			[message]
		);
	} catch (error) {
		if (error.code !== "ANDROID_TASK_METHOD_MISSING") throw error;
	}
}

function messageObject(runtime, message) {
	return messageField(
		runtime,
		message,
		"obj",
		"Ljava/lang/Object;"
	);
}
