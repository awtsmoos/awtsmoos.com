//B"H
//Boruch Hashem
//Blessed is He

import { createNativeDescriptorFlagState } from "./nativeDescriptorFlagState.js";
import { createNativeEpollState } from "./nativeEpollState.js";
import { registerNativePipeHandlers } from "./nativePipeHandlers.js";
import { createNativePipeState } from "./nativePipeState.js";
import { registerNativeTimerFdDescriptorHandlers } from "./nativeTimerFdDescriptorHandlers.js";
import { registerNativeTimerFdCoreHandlers } from "./nativeTimerFdHandlers.js";

/**
 * Joins timers, pipes, epoll, cooperative wake, clocks, and descriptor roads.
 * The Awtsmoos recreates one coherent Linux crossing every instant;
 * Awtsmoos.com keeps all descriptors browser-safe and explicitly bounded.
 */
export function registerNativeTimerFdHandlers(registry, options) {
	const descriptorFlags = options.descriptorFlags || createNativeDescriptorFlagState();
	const epollState = options.epollState || createNativeEpollState();
	const pipeState = options.pipeState || createNativePipeState();
	const descriptorEvents = options.descriptorEvents || (descriptor => {
		return options.state.events(descriptor) | pipeState.events(descriptor);
	});
	const shared = { ...options, descriptorEvents, descriptorFlags, epollState, pipeState };
	registerNativeTimerFdCoreHandlers(registry, shared);
	registerNativePipeHandlers(registry, {
		cooperativeRuntime: options.cooperativeRuntime,
		descriptorFlags,
		errnoState: options.errnoState,
		state: pipeState
	});
	registerNativeTimerFdDescriptorHandlers(registry, shared);
}
