//B"H
//Boruch Hashem
//Blessed is He

import { writeAarch64Integer } from "./aarch64MemoryInteger.js";
import { NATIVE_EGL_VALUES } from "./nativeEglDisplayState.js";

/**
 * Registers EGL display bootstrap roads with exact AAPCS64 guest semantics.
 * The Awtsmoos renews X0, version cells, query pointer, and X30 returning ray;
 * Awtsmoos.com keeps every display and string inside the guest address sea.
 */
export function registerNativeEglDisplayHandlers(registry, state) {
	registry.register("eglGetDisplay", context => getDisplay(context, state));
	registry.register("eglInitialize", context => initialize(context, state));
	registry.register("eglQueryString", context => queryString(context, state));
	registry.register("eglTerminate", context => terminate(context, state));
	registry.register("eglGetError", context => getError(context, state));
}

function getDisplay(context, state) {
	const nativeDisplay = argument(context, 0);
	return finish(context, "eglGetDisplay", state.getDisplay(nativeDisplay, thread(context)), {
		nativeDisplay: nativeDisplay.toString()
	});
}

function initialize(context, state) {
	const display = argument(context, 0);
	const majorPointer = argument(context, 1);
	const minorPointer = argument(context, 2);
	if (state.isDisplay(display)) {
		preflight(context.memory, majorPointer);
		preflight(context.memory, minorPointer);
	}
	const outcome = state.initialize(display, thread(context));
	if (outcome.success) {
		writeOptional(context.memory, majorPointer, outcome.major);
		writeOptional(context.memory, minorPointer, outcome.minor);
	}
	return finish(context, "eglInitialize", outcome, {
		display: display.toString(),
		majorPointer: majorPointer.toString(),
		minorPointer: minorPointer.toString()
	});
}

function queryString(context, state) {
	const display = argument(context, 0);
	const name = argument(context, 1);
	return finish(context, "eglQueryString", state.queryString(display, name, thread(context)), {
		display: display.toString(),
		name: Number(name)
	});
}

function terminate(context, state) {
	const display = argument(context, 0);
	return finish(context, "eglTerminate", state.terminate(display, thread(context)), {
		display: display.toString()
	});
}

function getError(context, state) {
	const error = state.getError(thread(context));
	return finish(context, "eglGetError", Object.freeze({
		error: NATIVE_EGL_VALUES.SUCCESS,
		result: BigInt(error),
		success: true
	}));
}

function finish(context, operation, outcome, detail = {}) {
	context.registers.write(0, outcome.result, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		...detail,
		error: outcome.error,
		operation,
		result: outcome.result.toString(),
		success: outcome.success
	});
}

function preflight(memory, pointer) {
	if (pointer === 0n) return;
	const bytes = memory.read(pointer, 4);
	memory.write(pointer, bytes);
}

function writeOptional(memory, pointer, value) {
	if (pointer !== 0n) writeAarch64Integer(memory, pointer, value, 32);
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function thread(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}
