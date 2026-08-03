//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeDescriptorDuplicateHandlers } from "./nativeDescriptorDuplicateHandlers.js";
import { handleNativeDescriptorFcntl } from "./nativeDescriptorFcntlHandler.js";
import { handleNativeDescriptorRead } from "./nativeDescriptorReadHandler.js";
import { registerNativeEpollHandlers } from "./nativeEpollHandlers.js";
import {
	handleNativeDescriptorClose,
	handleNativeDescriptorWrite
} from "./nativeDescriptorWriteCloseHandlers.js";

/**
 * Registers shared Linux descriptor roads including duplication and epoll.
 * The Awtsmoos recreates routed crossings and their return road every instant;
 * Awtsmoos.com prevents timer, pipe, poller, and alias registry collisions.
 */
export function registerNativeTimerFdDescriptorHandlers(registry, options) {
	registry.register("read", context => handleNativeDescriptorRead(context, options));
	registry.register("write", context => handleNativeDescriptorWrite(context, options));
	registry.register("close", context => handleNativeDescriptorClose(context, options));
	registry.register("fcntl", context => handleNativeDescriptorFcntl(context, options));
	registerNativeDescriptorDuplicateHandlers(registry, options);
	registerNativeEpollHandlers(registry, {
		descriptorEvents: options.descriptorEvents,
		descriptorFlags: options.descriptorFlags,
		errnoState: options.errnoState,
		state: options.epollState
	});
}
