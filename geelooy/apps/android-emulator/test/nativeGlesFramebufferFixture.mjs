//B"H
//Boruch Hashem
//Blessed is He

import { createAndroidGraphicsTrace } from "../core/android/graphicsTrace.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglContextState } from "../core/native/nativeEglContextState.js";
import { createNativeEglDisplayState } from "../core/native/nativeEglDisplayState.js";
import { getNativeGlesFramebufferState } from "../core/native/nativeGlesFramebufferState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeGlesFramebufferHandlers } from "../core/native/registerNativeGlesFramebufferHandlers.js";

export const FRAMEBUFFER_THREAD = 0x8300n;
export const FRAMEBUFFER_RETURN = 0xbbb0n;

/** Builds one current EGL/GLES context for framebuffer ABI tests without browser shortcuts. */
export function createNativeGlesFramebufferFixture() {
	const heap = createNativeHeap(0x1000n, 0x40000);
	const trace = createAndroidGraphicsTrace();
	const runtimeState = Object.freeze({ nativeGraphicsTrace: trace, nativeHeap: heap });
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, FRAMEBUFFER_THREAD).result;
	displayState.initialize(display, FRAMEBUFFER_THREAD);
	const config = createNativeEglConfigState(displayState);
	const contexts = createNativeEglContextState(displayState, config);
	const context = contexts.create(display, NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE, 0n, [], FRAMEBUFFER_THREAD).context;
	contexts.bind(FRAMEBUFFER_THREAD, context);
	const state = getNativeGlesFramebufferState(runtimeState, contexts);
	const registry = createNativeHostImportRegistry();
	registerNativeGlesFramebufferHandlers(registry, state);
	return { context, memory: heap, registers: createAarch64Registers({ programCounter: 0x9900n }), registry, state, systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: FRAMEBUFFER_THREAD }), trace };
}

/** Invokes one registered framebuffer import using exact guest registers and X30 return. */
export function invokeFramebuffer(fixture, name, ...values) {
	fixture.registers.pc = 0x9900n;
	values.forEach((value, index) => fixture.registers.write(index, BigInt(value)));
	fixture.registers.write(30, FRAMEBUFFER_RETURN);
	return fixture.registry.handle({ name }, fixture);
}
