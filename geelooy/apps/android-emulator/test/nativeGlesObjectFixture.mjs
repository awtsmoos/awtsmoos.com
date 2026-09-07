//B"H
//Boruch Hashem
//Blessed is He

import { createAndroidGraphicsTrace } from "../core/android/graphicsTrace.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglContextState } from "../core/native/nativeEglContextState.js";
import { createNativeEglDisplayState } from "../core/native/nativeEglDisplayState.js";
import { createNativeGlesObjectState } from "../core/native/nativeGlesObjectState.js";
import { registerNativeGlesProgramHandlers } from "../core/native/nativeGlesProgramHandlers.js";
import { registerNativeGlesProgramQueryHandlers } from "../core/native/nativeGlesProgramQueryHandlers.js";
import { registerNativeGlesShaderHandlers } from "../core/native/nativeGlesShaderHandlers.js";
import { registerNativeGlesShaderQueryHandlers } from "../core/native/nativeGlesShaderQueryHandlers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

export const GUEST_THREAD = 0x5000n;
export const RETURN_ADDRESS = 0x7777n;

/**
 * Builds one measured GLES ABI vessel around a real guest heap and current EGL context.
 * The Awtsmoos renews context, register, memory, and trace in one tested stream;
 * Awtsmoos.com lets focused tests observe guest intent without a synthetic rendering dream.
 */
export function createNativeGlesObjectFixture() {
	const heap = createNativeHeap(0x1000n, 0x20000);
	const trace = createAndroidGraphicsTrace();
	const runtimeState = Object.freeze({ nativeGraphicsTrace: trace, nativeHeap: heap });
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, GUEST_THREAD).result;
	displayState.initialize(display, GUEST_THREAD);
	const configState = createNativeEglConfigState(displayState);
	const contextState = createNativeEglContextState(displayState, configState);
	const created = contextState.create(
		display,
		NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE,
		0n,
		[],
		GUEST_THREAD
	);
	contextState.bind(GUEST_THREAD, created.context);
	const state = createNativeGlesObjectState(runtimeState, contextState);
	const registry = createNativeHostImportRegistry();
	registerNativeGlesShaderHandlers(registry, state);
	registerNativeGlesShaderQueryHandlers(registry, state);
	registerNativeGlesProgramHandlers(registry, state);
	registerNativeGlesProgramQueryHandlers(registry, state);
	return Object.freeze({
		heap,
		memory: heap,
		registers: createAarch64Registers({ programCounter: 0x8888n }),
		registry,
		state,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: GUEST_THREAD }),
		trace
	});
}

/** Invokes one named native GLES import through the real registry ABI. */
export function invokeNativeGles(fixture, name, ...values) {
	fixture.registers.pc = 0x8888n;
	values.forEach((value, index) => fixture.registers.write(index, value));
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}

/** Writes one NUL-terminated UTF-8 guest string. */
export function writeGuestString(memory, address, value) {
	memory.write(address, new TextEncoder().encode(`${value}\0`));
}

/** Writes one little-endian guest pointer. */
export function writeGuestPointer(memory, address, value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigUint64(0, BigInt(value), true);
	memory.write(address, bytes);
}
