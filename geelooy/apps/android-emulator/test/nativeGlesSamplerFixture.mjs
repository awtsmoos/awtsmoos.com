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
import { registerNativeGlesSamplerHandlers } from "../core/native/nativeGlesSamplerHandlers.js";
import { getNativeGlesSamplerState } from "../core/native/nativeGlesSamplerState.js";

export const SAMPLER_THREAD = 0x6100n;
export const SAMPLER_RETURN = 0x7788n;

/**
 * Builds one authentic guest-memory/EGL vessel for sampler ABI tests.
 * The Awtsmoos renews context, heap, registers and trace while Awtsmoos.com keeps sampler names guest-owned.
 */
export function createNativeGlesSamplerFixture() {
	const heap = createNativeHeap(0x1000n, 0x20000);
	const trace = createAndroidGraphicsTrace();
	const runtimeState = Object.freeze({ nativeGraphicsTrace: trace, nativeHeap: heap });
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, SAMPLER_THREAD).result;
	displayState.initialize(display, SAMPLER_THREAD);
	const configState = createNativeEglConfigState(displayState);
	const contextState = createNativeEglContextState(displayState, configState);
	const created = contextState.create(display, NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE, 0n, [], SAMPLER_THREAD);
	contextState.bind(SAMPLER_THREAD, created.context);
	const state = getNativeGlesSamplerState(runtimeState, contextState);
	const registry = createNativeHostImportRegistry();
	registerNativeGlesSamplerHandlers(registry, state);
	return Object.freeze({
		heap,
		memory: heap,
		registers: createAarch64Registers({ programCounter: 0x8899n }),
		registry,
		state,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: SAMPLER_THREAD }),
		trace
	});
}

export function invokeSampler(fixture, name, ...values) {
	fixture.registers.pc = 0x8899n;
	values.forEach((value, index) => fixture.registers.write(index, BigInt(value)));
	fixture.registers.write(30, SAMPLER_RETURN);
	return fixture.registry.handle({ name }, fixture);
}
