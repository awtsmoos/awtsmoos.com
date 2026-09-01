//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeAndroidWindowBufferHandlers } from "./nativeAndroidWindowBufferHandlers.js";
import { getNativeAndroidWindowBufferState } from "./nativeAndroidWindowBufferState.js";
import { registerNativeAndroidWindowHandlers } from "./nativeAndroidWindowHandlers.js";
import { getNativeAndroidWindowState } from "./nativeAndroidWindowState.js";
import { registerNativeEglConfigHandlers } from "./nativeEglConfigHandlers.js";
import { createNativeEglConfigState } from "./nativeEglConfigState.js";
import { registerNativeEglContextHandlers } from "./nativeEglContextHandlers.js";
import { getNativeEglContextState } from "./nativeEglContextState.js";
import { registerNativeEglDisplayHandlers } from "./nativeEglDisplayHandlers.js";
import { getNativeEglDisplayState } from "./nativeEglDisplayState.js";
import { registerNativeEglProcAddressHandlers } from "./nativeEglProcAddressHandlers.js";
import { registerNativeEglSurfaceHandlers } from "./nativeEglSurfaceHandlers.js";
import { getNativeEglSurfaceState } from "./nativeEglSurfaceState.js";
import { registerNativeEglWindowSurfaceHandlers } from "./nativeEglWindowSurfaceHandlers.js";
import { registerNativeGlesInternalFormatHandlers } from "./nativeGlesInternalFormatHandlers.js";
import { registerNativeGlesShaderPrecisionHandlers } from "./nativeGlesShaderPrecisionHandlers.js";
import { registerNativeGlesStringHandlers } from "./nativeGlesStringHandlers.js";
import { getNativeGlesStringState } from "./nativeGlesStringState.js";

/**
 * Registers Android windows, EGL lifecycle, and measured GLES queries through one gate.
 * The Awtsmoos renews window, buffer, display, context, and precision in light;
 * Awtsmoos.com leaves every still-unmeasured rendering boundary explicit and bright.
 */
export function registerNativeGraphicsHandlers(registry, runtimeState) {
	const display = getNativeEglDisplayState(runtimeState);
	const config = createNativeEglConfigState(display);
	const context = getNativeEglContextState(runtimeState, display, config);
	const surface = getNativeEglSurfaceState(runtimeState, display, config, context);
	const windows = getNativeAndroidWindowState(runtimeState);
	const buffers = getNativeAndroidWindowBufferState(runtimeState, windows);
	const strings = getNativeGlesStringState(runtimeState, context);
	registerNativeAndroidWindowHandlers(registry, runtimeState, windows, buffers);
	registerNativeAndroidWindowBufferHandlers(registry, buffers);
	registerNativeEglDisplayHandlers(registry, display);
	registerNativeEglConfigHandlers(registry, { configState: config, displayState: display });
	registerNativeEglContextHandlers(registry, context);
	registerNativeEglProcAddressHandlers(registry, runtimeState.imports);
	registerNativeEglSurfaceHandlers(registry, surface);
	registerNativeEglWindowSurfaceHandlers(registry, surface, windows);
	registerNativeGlesStringHandlers(registry, strings);
	registerNativeGlesShaderPrecisionHandlers(registry, strings);
	registerNativeGlesInternalFormatHandlers(registry, strings);
	return Object.freeze({ buffers, config, context, display, strings, surface, windows });
}
