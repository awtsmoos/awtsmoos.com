//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeEglConfigHandlers } from "./nativeEglConfigHandlers.js";
import { createNativeEglConfigState } from "./nativeEglConfigState.js";
import { registerNativeEglContextHandlers } from "./nativeEglContextHandlers.js";
import { getNativeEglContextState } from "./nativeEglContextState.js";
import { registerNativeEglDisplayHandlers } from "./nativeEglDisplayHandlers.js";
import { getNativeEglDisplayState } from "./nativeEglDisplayState.js";
import { registerNativeEglProcAddressHandlers } from "./nativeEglProcAddressHandlers.js";
import { registerNativeEglSurfaceHandlers } from "./nativeEglSurfaceHandlers.js";
import { getNativeEglSurfaceState } from "./nativeEglSurfaceState.js";
import { registerNativeGlesStringHandlers } from "./nativeGlesStringHandlers.js";
import { getNativeGlesStringState } from "./nativeGlesStringState.js";

/**
 * Registers EGL lifecycle and measured GLES identity through one graphics gate.
 * The Awtsmoos renews display, context, surface, and string in ordered light;
 * Awtsmoos.com leaves every later rendering boundary unsupported and bright.
 */
export function registerNativeGraphicsHandlers(registry, runtimeState) {
	const display = getNativeEglDisplayState(runtimeState);
	const config = createNativeEglConfigState(display);
	const context = getNativeEglContextState(runtimeState, display, config);
	const surface = getNativeEglSurfaceState(runtimeState, display, config, context);
	const strings = getNativeGlesStringState(runtimeState, context);
	registerNativeEglDisplayHandlers(registry, display);
	registerNativeEglConfigHandlers(registry, {
		configState: config,
		displayState: display
	});
	registerNativeEglContextHandlers(registry, context);
	registerNativeEglProcAddressHandlers(registry, runtimeState.imports);
	registerNativeEglSurfaceHandlers(registry, surface);
	registerNativeGlesStringHandlers(registry, strings);
	return Object.freeze({ config, context, display, strings, surface });
}
