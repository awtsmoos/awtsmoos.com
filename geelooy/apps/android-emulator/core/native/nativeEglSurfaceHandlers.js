//B"H
//Boruch Hashem
//Blessed is He

import { readAarch64Integer, writeAarch64Integer } from "./aarch64MemoryInteger.js";
import { NATIVE_EGL_CONFIG_VALUES } from "./nativeEglConfigState.js";

const MAXIMUM_ATTRIBUTE_PAIRS = 64;

/**
 * Registers deterministic pbuffer, binding, query, swap, and teardown roads.
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
	const attributes = readAttributes(context.memory, pointer);
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

function readAttributes(memory, pointer) {
	if (pointer === 0n) return Object.freeze([]);
	const attributes = [];
	for (let index = 0; index < MAXIMUM_ATTRIBUTE_PAIRS; index += 1) {
		const address = pointer + BigInt(index * 8);
		const key = readAarch64Integer(memory, address, 32);
		if (Number(key) === NATIVE_EGL_CONFIG_VALUES.NONE) return Object.freeze(attributes);
		const value = readAarch64Integer(memory, address + 4n, 32);
		attributes.push(Object.freeze({ key: Number(key), value: Number(BigInt.asIntN(32, value)) }));
	}
	const error = new Error(`NATIVE_EGL_ATTRIBUTE_TERMINATOR:${pointer}`);
	error.code = "NATIVE_EGL_ATTRIBUTE_TERMINATOR";
	throw error;
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
