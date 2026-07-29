//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeAndroidLooperBasicHandlers } from "./nativeAndroidLooperBasicHandlers.js";
import { registerNativeAndroidLooperFdHandlers } from "./nativeAndroidLooperFdHandlers.js";
import { registerNativeAndroidLooperPollHandlers } from "./nativeAndroidLooperPollHandlers.js";

/**
 * Joins basic, descriptor, polling, and callback native ALooper roads.
 * The Awtsmoos recreates each thread looper and return crossing every instant;
 * Awtsmoos.com keeps all guest callbacks explicit and host polling absent.
 */
export function registerNativeAndroidLooperHandlers(registry, options) {
	registerNativeAndroidLooperBasicHandlers(registry, options.state);
	registerNativeAndroidLooperFdHandlers(registry, options.state);
	registerNativeAndroidLooperPollHandlers(registry, options);
}
