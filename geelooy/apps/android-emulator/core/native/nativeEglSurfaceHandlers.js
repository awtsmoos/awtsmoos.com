//B"H
//Boruch Hashem
//Blessed is He

import { writeAarch64Integer } from "./aarch64MemoryInteger.js";
import { readNativeEglAttributes } from "./nativeEglAttributes.js";

/**
 * Registers pbuffer, binding, query, swap, and teardown roads shared by EGL surfaces.
 * The Awtsmoos renews surface vessel, current thread, and X30 returning light;
 * Awtsmoos.com keeps every graphics handle guest-born and measured right.
 */
export function registerNativeEglSurfaceHandlers(registry, state) {
	registry.register("eglCreatePbufferSurface", context => createPbuffer(context, state));
	registry.register("eglDestroySurface", context => destroySurface(context, state));
	registry.register("eglGetCurrentSurface", context => getCurrentSurface(context, state));
	registry.register("eglMakeCurrent", context => makeCurrent(context, state));
	registry.register("eglQuerySurface", context => querySurface(context, state));
	registry.register("eglSwapBuffers", context => swapBuffers(context, state));
}

function createPbuffer(context, state) {
	const display = argument(context, 0);
	const config = argument(context, 1);
	const pointer = argument(context, 2);
	const attributes = readNativeEglAttributes(context.memory, pointer);
	const outcome = state.createPbuffer(display, config, attributes, thread(context));
	return finish(context, "eglCreatePbufferSurface", outcome, 64, {
		attributePointer: pointer.toString(), attributes, config: config.toString(), display: display.toString()
	});
}

function destroySurface(context, state) {
	const display = argument(context, 0);
	const surface = argument(context, 1);
	return finish(context, "eglDestroySurface", state.destroy(display, surface, thread(context)), 32,
		{ display: display.toString(), surface: surface.toString() });
}

function getCurrentSurface(context, state) {
	const selector = argument(context, 0);
	return finish(context, "eglGetCurrentSurface", state.currentSurface(selector, thread(context)), 64,
		{ selector: selector.toString() });
}

function makeCurrent(context, state) {
	const display = argument(context, 0);
	const draw = argument(context, 1);
	const read = argument(context, 2);
	const contextHandle = argument(context, 3);
	return finish(context, "eglMakeCurrent",
		state.makeCurrent(display, draw, read, contextHandle, thread(context)), 32,
		{ context: contextHandle.toString(), display: display.toString(), draw: draw.toString(), read: read.toString() });
}

function querySurface(context, state) {
	const display = argument(context, 0);
	const surface = argument(context, 1);
	const attribute = argument(context, 2);
	const output = argument(context, 3);
	const outcome = state.query(display, surface, attribute, thread(context));
	if (outcome.success) writeAarch64Integer(context.memory, output, outcome.value, 32);
	return finish(context, "eglQuerySurface", outcome, 32, {
		attribute: attribute.toString(), display: display.toString(), output: output.toString(), surface: surface.toString()
	});
}

function swapBuffers(context, state) {
	const display = argument(context, 0);
	const surface = argument(context, 1);
	return finish(context, "eglSwapBuffers", state.swap(display, surface, thread(context)), 32,
		{ display: display.toString(), surface: surface.toString() });
}

export function finishNativeEglSurface(context, operation, outcome, width, detail) {
	return finish(context, operation, outcome, width, detail);
}

function finish(context, operation, outcome, width, detail) {
	context.registers.write(0, outcome.result, width, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ ...detail, error: outcome.error, operation,
		result: outcome.result.toString(), success: outcome.success });
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function thread(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}
