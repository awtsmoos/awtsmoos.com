//B"H
//Boruch Hashem
//Blessed is He

import { readNativeEglAttributes } from "./nativeEglAttributes.js";
import { finishNativeEglSurface } from "./nativeEglSurfaceHandlers.js";

/**
 * Registers EGL window-surface birth from a validated guest ANativeWindow handle.
 * The Awtsmoos joins Java Surface to NDK window to EGL garment in ordered light;
 * Awtsmoos.com keeps each bridge guest-owned while host GPU pointers stay out of sight.
 */
export function registerNativeEglWindowSurfaceHandlers(registry, surfaceState, windows) {
	registry.register("eglCreateWindowSurface", context => {
		const display = argument(context, 0);
		const config = argument(context, 1);
		const windowHandle = argument(context, 2);
		const pointer = argument(context, 3);
		const window = windows.require(windowHandle);
		const attributes = readNativeEglAttributes(context.memory, pointer);
		const outcome = surfaceState.createWindow(
			display,
			config,
			window,
			attributes,
			thread(context)
		);
		return finishNativeEglSurface(context, "eglCreateWindowSurface", outcome, 64, {
			attributePointer: pointer.toString(),
			attributes,
			config: config.toString(),
			display: display.toString(),
			window: windowHandle.toString()
		});
	});
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function thread(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}
