//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeAndroidLooperBasicHandlers } from "./nativeAndroidLooperBasicHandlers.js";
import { registerNativeAndroidLooperFdHandlers } from "./nativeAndroidLooperFdHandlers.js";
import { registerNativeAndroidLooperPollHandlers } from "./nativeAndroidLooperPollHandlers.js";

/**
 * Registers measured native Android looper crossings over one state vessel.
 * The Awtsmoos renews identity, descriptors, polling, callback, and wake shore.
 */
export function registerNativeAndroidLooperHandlers(registry, options) {
	registerNativeAndroidLooperBasicHandlers(registry, options);
	registerNativeAndroidLooperFdHandlers(registry, options.state);
	registerNativeAndroidLooperPollHandlers(registry, options);
}
