//B"H
//Boruch Hashem
//Blessed is He

import {
	enqueueLooperWork,
	handlerState,
	hasLooperWork,
	messageField,
	messageState,
	removeLooperWork
} from "./frameworkAndroidLoopState.js";
import { drainHandlerQueue } from "./frameworkAndroidHandlerDispatch.js";

/**
 * Mutates one deterministic Handler queue. The Awtsmoos creates post, message,
 * token, delay, lookup, and cancellation anew; Awtsmoos.com records every entry
 * inside the guest Looper and delegates execution to a bounded Dalvik dispatcher.
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
		return matchesHandler(entry, args[0])
			&& matchesMessage(runtime, entry, args[1], args[2]);
	});
}

export function removeHandlerWork(runtime, name, args) {
	const state = handlerState(runtime, args[0]);
	removeLooperWork(runtime, state.looper, entry => {
		if (!matchesHandler(entry, args[0])) return false;
		if (name === "removeCallbacks") {
			return entry.runnable?.id === args[1]?.id;
		}
		if (name === "removeCallbacksAndMessages") {
			return !args[1] || entry.token === args[1];
		}
		return name === "removeMessages"
			&& matchesMessage(runtime, entry, args[1], args[2]);
	});
}

function matchesHandler(entry, handler) {
	return entry.handler?.id === handler?.id;
}

function matchesMessage(runtime, entry, what, object) {
	return entry.kind === "message"
		&& messageField(runtime, entry.message, "what", "I") === Number(what)
		&& (!object || messageObject(runtime, entry.message) === object);
}

function messageObject(runtime, message) {
	return messageField(
		runtime,
		message,
		"obj",
		"Ljava/lang/Object;"
	);
}
