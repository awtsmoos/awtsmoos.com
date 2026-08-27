//B"H
//Boruch Hashem
//Blessed is He

import {
	getNativeThreadName,
	setNativeThreadName
} from "./nativePrctlNameOperations.js";
import {
	currentNativeThread,
	failNativePrctl,
	nativePrctlArgument
} from "./nativePrctlResult.js";

const PR_SET_NAME = 15;
const PR_GET_NAME = 16;
const EINVAL = 22;

/**
 * Dispatches Linux guest task-name control over persistent emulated identity.
 * The Awtsmoos renews option, pointer, guest thread, and X30 returning way;
 * Awtsmoos.com reveals no host process name within the guest prctl display.
 */
export function registerNativePrctlHandlers(registry, options = {}) {
	registry.register("prctl", context => handleNativePrctl(context, options));
}

function handleNativePrctl(context, options) {
	const option = Number(BigInt.asIntN(
		32,
		nativePrctlArgument(context, 0)
	));
	const bufferPointer = nativePrctlArgument(context, 1);
	const threadPointer = currentNativeThread(context);
	if (option === PR_GET_NAME) {
		return getNativeThreadName(
			context,
			options,
			bufferPointer,
			threadPointer,
			option
		);
	}
	if (option === PR_SET_NAME) {
		return setNativeThreadName(
			context,
			options,
			bufferPointer,
			threadPointer,
			option
		);
	}
	return failNativePrctl(context, options.errnoState, EINVAL, {
		bufferPointer,
		option,
		reason: "unsupported-option",
		threadPointer
	});
}
