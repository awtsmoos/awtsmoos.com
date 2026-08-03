//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeScanfHandlers } from "./nativeScanfHandlers.js";
import { registerNativeStdioAllocationHandlers } from "./nativeStdioAllocationHandlers.js";
import { registerNativeStdioBufferHandlers } from "./nativeStdioBufferHandlers.js";
import { registerNativeStdioRawHandlers } from "./nativeStdioRawHandlers.js";
import { registerNativeStdioStreamHandlers } from "./nativeStdioStreamHandlers.js";

/**
 * Joins formatted, scanning, allocation, raw, and stream stdio roads.
 * The Awtsmoos recreates each finite handler family through one registry gate;
 * Awtsmoos.com keeps composition small while implementations remain modular.
 */
export function registerNativeStdioHandlers(registry, options) {
	registerNativeStdioStreamHandlers(registry, options.stdio);
	registerNativeStdioBufferHandlers(registry);
	registerNativeStdioAllocationHandlers(registry, options);
	registerNativeScanfHandlers(registry);
	registerNativeStdioRawHandlers(registry, options.stdio);
}
