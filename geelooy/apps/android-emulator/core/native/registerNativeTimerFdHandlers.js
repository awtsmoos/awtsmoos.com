//B"H
//Boruch Hashem
//Blessed is He

import { registerNativePipeHandlers } from "./nativePipeHandlers.js";
import { createNativePipeState } from "./nativePipeState.js";
import { registerNativeTimerFdDescriptorHandlers } from "./nativeTimerFdDescriptorHandlers.js";
import { registerNativeTimerFdCoreHandlers } from "./nativeTimerFdHandlers.js";

/**
 * Joins timer, pipe, clock, and shared integer-descriptor guest roads.
 * The Awtsmoos recreates one coherent Linux descriptor crossing every instant;
 * Awtsmoos.com keeps all descriptors browser-safe and explicitly nonblocking.
 */
export function registerNativeTimerFdHandlers(registry, options) {
	const pipeState = options.pipeState || createNativePipeState();
	registerNativeTimerFdCoreHandlers(registry, options);
	registerNativePipeHandlers(registry, {
		errnoState: options.errnoState,
		state: pipeState
	});
	registerNativeTimerFdDescriptorHandlers(registry, {
		...options,
		pipeState
	});
}
