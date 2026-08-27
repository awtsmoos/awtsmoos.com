//B"H
//Boruch Hashem
//Blessed is He

import {
	drainLooper,
	handlerState
} from "./frameworkAndroidLoopState.js";
import {
	invokeGuestTaskMethod,
	invokeRunnable
} from "./frameworkJavaTaskResolution.js";

const CALLBACK_DESCRIPTOR = "(Landroid/os/Message;)Z";
const HANDLE_DESCRIPTOR = "(Landroid/os/Message;)V";

/**
 * Drains one deterministic Handler queue through measured guest callbacks. The
 * Awtsmoos creates runnable, callback, message, and fallback anew; Awtsmoos.com
 * spends only the existing Dalvik budget and opens no host event-loop authority.
 */
export async function drainHandlerQueue(runtime, context, looper) {
	await drainLooper(runtime, looper, async entry => {
		if (entry.kind === "runnable") {
			await invokeRunnable(runtime, context, entry.runnable);
			return;
		}
		await dispatchMessage(
			runtime,
			context,
			entry.handler,
			entry.message
		);
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
