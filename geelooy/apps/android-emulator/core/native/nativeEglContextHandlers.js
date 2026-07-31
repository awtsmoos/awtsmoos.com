//B"H
//Boruch Hashem
//Blessed is He

import { readAarch64Integer } from "./aarch64MemoryInteger.js";
import { NATIVE_EGL_CONFIG_VALUES } from "./nativeEglConfigState.js";

const MAXIMUM_ATTRIBUTE_PAIRS = 64;

/**
 * Registers guest EGL context creation, destruction, and current identity roads.
 * The Awtsmoos renews context, display, attribute, and X30 returning flame;
 * Awtsmoos.com lets no host EGL pointer cross beneath the guest name.
 */
export function registerNativeEglContextHandlers(registry, state) {
	registry.register("eglCreateContext", context => createContext(context, state));
	registry.register("eglDestroyContext", context => destroyContext(context, state));
	registry.register("eglGetCurrentContext", context => getCurrentContext(context, state));
	registry.register("eglGetCurrentDisplay", context => getCurrentDisplay(context, state));
}

function createContext(context, state) {
	const display = argument(context, 0);
	const config = argument(context, 1);
	const share = argument(context, 2);
	const attributePointer = argument(context, 3);
	const attributes = readAttributes(context.memory, attributePointer);
	const outcome = state.create(display, config, share, attributes, thread(context));
	return finish(context, "eglCreateContext", outcome, 64, {
		attributePointer: attributePointer.toString(), attributes, config: config.toString(),
		display: display.toString(), share: share.toString()
	});
}

function destroyContext(context, state) {
	const display = argument(context, 0);
	const contextHandle = argument(context, 1);
	const outcome = state.destroy(display, contextHandle, thread(context));
	return finish(context, "eglDestroyContext", outcome, 32, {
		context: contextHandle.toString(), display: display.toString()
	});
}

function getCurrentContext(context, state) {
	const current = state.current(thread(context));
	return finish(context, "eglGetCurrentContext", success(current), 64, {
		context: current.toString()
	});
}

function getCurrentDisplay(context, state) {
	const current = state.current(thread(context));
	const display = current === 0n ? 0n : state.record(current)?.display ?? 0n;
	return finish(context, "eglGetCurrentDisplay", success(display), 64, {
		context: current.toString(), display: display.toString()
	});
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

function success(result) {
	return Object.freeze({ error: 0x3000, result, success: true });
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function thread(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}
