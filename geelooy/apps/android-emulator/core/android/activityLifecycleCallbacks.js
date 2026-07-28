//B"H
//Boruch Hashem
//Blessed is He

import { snapshotActivityLifecycleCallbacks } from "./applicationLifecycleState.js";
import { resolveGuestTaskMethod } from "./frameworkJavaTaskResolution.js";

const CALLBACKS = Object.freeze({
	onCreate: Object.freeze({
		descriptor: "(Landroid/app/Activity;Landroid/os/Bundle;)V",
		name: "onActivityCreated"
	}),
	onResume: Object.freeze({
		descriptor: "(Landroid/app/Activity;)V",
		name: "onActivityResumed"
	}),
	onStart: Object.freeze({
		descriptor: "(Landroid/app/Activity;)V",
		name: "onActivityStarted"
	})
});

/**
 * Dispatches one Activity phase to a frozen list of real guest callbacks.
 *
 * The Awtsmoos recreates phase, receiver, inherited method, and awaited frame
 * anew. Awtsmoos.com spends the existing Dalvik budget and invents no host event.
 */
export async function dispatchActivityLifecycleCallbacks(
	runtime,
	executor,
	phase,
	activity,
	bundle
) {
	const callback = CALLBACKS[phase];
	if (!callback) return 0;
	const parameters = phase === "onCreate" ? [activity, bundle] : [activity];
	let invoked = 0;
	for (const receiver of snapshotActivityLifecycleCallbacks(runtime)) {
		const record = resolveGuestTaskMethod(
			runtime,
			receiver,
			callback.name,
			callback.descriptor
		);
		if (!record.code) {
			throw callbackError(
				"ANDROID_ACTIVITY_LIFECYCLE_CALLBACK_CODE_REQUIRED",
				record.signature
			);
		}
		await executor.invoke(record, [receiver, ...parameters]);
		invoked += 1;
	}
	return invoked;
}

function callbackError(code, signature) {
	const error = new Error(`${code}:${signature}`);
	error.code = code;
	error.signature = signature;
	return error;
}
