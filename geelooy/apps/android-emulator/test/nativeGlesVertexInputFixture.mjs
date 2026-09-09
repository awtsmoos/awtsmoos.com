//B"H
//Boruch Hashem
//Blessed is He

import { createAndroidGraphicsTrace } from "../core/android/graphicsTrace.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglContextState } from "../core/native/nativeEglContextState.js";
import { createNativeEglDisplayState } from "../core/native/nativeEglDisplayState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { getNativeGlesVertexInputState } from "../core/native/nativeGlesVertexInputState.js";
import { registerNativeGlesVertexInputHandlers } from "../core/native/registerNativeGlesVertexInputHandlers.js";

export const VERTEX_THREAD = 0x8200n;
export const VERTEX_RETURN = 0xaaa0n;

/** Builds one current GLES context for authentic buffer and VAO ABI tests. */
export function createNativeGlesVertexInputFixture() {
	const heap = createNativeHeap(0x1000n, 0x40000);
	const trace = createAndroidGraphicsTrace();
	const runtimeState = Object.freeze({ nativeGraphicsTrace: trace, nativeHeap: heap });
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, VERTEX_THREAD).result;
	displayState.initialize(display, VERTEX_THREAD);
	const configState = createNativeEglConfigState(displayState);
	const contextState = createNativeEglContextState(displayState, configState);
	const context = contextState.create(display, NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE, 0n, [], VERTEX_THREAD).context;
	contextState.bind(VERTEX_THREAD, context);
	const state = getNativeGlesVertexInputState(runtimeState, contextState);
	const registry = createNativeHostImportRegistry();
	registerNativeGlesVertexInputHandlers(registry, state);
	return Object.freeze({ context, memory: heap, registers: createAarch64Registers({ programCounter: 0x9900n }), registry, state, systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: VERTEX_THREAD }), trace });
}

export function invokeVertexInput(fixture, name, ...values) {
	fixture.registers.pc = 0x9900n;
	values.forEach((value, index) => fixture.registers.write(index, BigInt(value)));
	fixture.registers.write(30, VERTEX_RETURN);
	return fixture.registry.handle({ name }, fixture);
}
