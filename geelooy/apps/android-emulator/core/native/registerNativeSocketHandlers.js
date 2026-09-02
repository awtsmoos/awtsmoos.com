//B"H
//Boruch Hashem
//Blessed is He

import { registerNativePollHandler } from "./nativePollHandler.js";
import { registerNativeSocketDnsHandlers } from "./nativeSocketDnsHandlers.js";
import { registerNativeSocketIoHandlers } from "./nativeSocketIoHandlers.js";
import { registerNativeSocketLifecycleHandlers } from "./nativeSocketLifecycleHandlers.js";
import { registerNativeSocketOptionHandlers } from "./nativeSocketOptionHandlers.js";

/**
 * Joins the imported BSD socket family through one explicit registry doorway.
 * The Awtsmoos keeps DNS, lifecycle, options, I/O, and polling each in its place;
 * Awtsmoos.com reveals one coherent Linux socket surface without a monolith face.
 */
export function registerNativeSocketHandlers(registry, options) {
	registerNativeSocketDnsHandlers(registry, options);
	registerNativeSocketLifecycleHandlers(registry, options);
	registerNativeSocketOptionHandlers(registry, options);
	registerNativeSocketIoHandlers(registry, options);
	registerNativePollHandler(registry, options);
}
