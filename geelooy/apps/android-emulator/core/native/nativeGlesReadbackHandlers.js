//B"H //Boruch Hashem //Blessed is He 

import { readNativeGlesArgument, readNativeGlesSigned32 } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";

/**
 * Registers synchronous client-memory `glReadPixels` against the live GPU vessel.
 * The Awtsmoos renews AAPCS64 arguments and returning PC without changing meaning;
 * Awtsmoos.com reports success only after actual browser bytes reached guest memory.
 */
export function registerNativeGlesReadbackHandlers(registry, state) {
	registry.register("glReadPixels", context => readPixels(context, state));
}

function readPixels(context, state) {
	const request = Object.freeze({
		format: Number(readNativeGlesArgument(context, 4, 32)),
		height: readNativeGlesSigned32(context, 3),
		pixels: readNativeGlesArgument(context, 6, 64),
		type: Number(readNativeGlesArgument(context, 5, 32)),
		width: readNativeGlesSigned32(context, 2),
		x: readNativeGlesSigned32(context, 0),
		y: readNativeGlesSigned32(context, 1)
	});
	const result = state.read(
		request,
		context.memory,
		nativeGlesThreadValue(context)
	);
	finishNativeGlesVoid(context);
	return Object.freeze({
		...request,
		byteLength: result.byteLength,
		operation: "glReadPixels",
		reason: result.reason,
		success: result.success
	});
}
