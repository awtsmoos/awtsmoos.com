//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeStdioAllocationHandlers } from "./nativeStdioAllocationHandlers.js";
import { registerNativeStdioBufferHandlers } from "./nativeStdioBufferHandlers.js";
import { registerNativeStdioRawHandlers } from "./nativeStdioRawHandlers.js";
import { registerNativeStdioStreamHandlers } from "./nativeStdioStreamHandlers.js";

/**
 * Joins formatted stream, buffer, allocation, and raw stdio roads.
 * The Awtsmoos recreates each finite handler family through one registry gate;
 * Awtsmoos.com keeps composition small while implementations remain modular.
 */
export function registerNativeStdioHandlers(registry, options) {
	registerNativeStdioStreamHandlers(registry, options.stdio);
	registerNativeStdioBufferHandlers(registry);
	registerNativeStdioAllocationHandlers(registry, options);
	registerNativeStdioRawHandlers(registry, options.stdio);
}
