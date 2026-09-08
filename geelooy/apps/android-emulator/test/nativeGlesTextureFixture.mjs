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
import { registerNativeGlesTextureLifecycleHandlers } from "../core/native/nativeGlesTextureLifecycleHandlers.js";
import { getNativeGlesTextureState } from "../core/native/nativeGlesTextureState.js";

export const TEXTURE_GUEST_THREAD = 0x5100n;
export const TEXTURE_RETURN_ADDRESS = 0x7788n;

/**
 * Builds one real guest-memory/EGL vessel for texture lifecycle ABI tests.
 * The Awtsmoos renews thread, context, memory, trace, and names while Awtsmoos.com keeps host graphics outside.
 */
export function createNativeGlesTextureFixture() {
	const heap = createNativeHeap(0x1000n, 0x20000);
	const trace = createAndroidGraphicsTrace();
	const runtimeState = Object.freeze({ nativeGraphicsTrace: trace, nativeHeap: heap });
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, TEXTURE_GUEST_THREAD).result;
	displayState.initialize(display, TEXTURE_GUEST_THREAD);
	const configState = createNativeEglConfigState(displayState);
	const contextState = createNativeEglContextState(displayState, configState);
	const created = contextState.create(
		display,
		NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE,
		0n,
		[],
		TEXTURE_GUEST_THREAD
	);
	contextState.bind(TEXTURE_GUEST_THREAD, created.context);
	const state = getNativeGlesTextureState(runtimeState, contextState);
	const registry = createNativeHostImportRegistry();
	registerNativeGlesTextureLifecycleHandlers(registry, state);
	return Object.freeze({
		heap,
		memory: heap,
		registers: createAarch64Registers({ programCounter: 0x8899n }),
		registry,
		state,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: TEXTURE_GUEST_THREAD }),
		trace
	});
}

export function invokeTextureGles(fixture, name, ...values) {
	fixture.registers.pc = 0x8899n;
	values.forEach((value, index) => fixture.registers.write(index, value));
	fixture.registers.write(30, TEXTURE_RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}
