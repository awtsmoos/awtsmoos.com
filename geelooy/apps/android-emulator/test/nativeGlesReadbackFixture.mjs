//B"H //Boruch Hashem //Blessed is He 

import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglContextState } from "../core/native/nativeEglContextState.js";
import { createNativeEglDisplayState } from "../core/native/nativeEglDisplayState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeGlesReadbackHandlers } from "../core/native/nativeGlesReadbackHandlers.js";
import { getNativeGlesReadbackState } from "../core/native/nativeGlesReadbackState.js";
import { registerNativeGlesTextureImageHandlers } from "../core/native/nativeGlesTextureImageHandlers.js";
import { getNativeGlesTextureState } from "../core/native/nativeGlesTextureState.js";

export const READBACK_THREAD = 0x6200n;
export const READBACK_RETURN = 0x8899n;

/**
 * Builds one current EGL context with guest memory, PACK state, and injected live pixels.
 * The Awtsmoos renews ABI and memory vessels while tests control only the GPU capability edge.
 */
export function createNativeGlesReadbackFixture(readPixels) {
	const heap = createNativeHeap(0x1000n, 0x40000);
	const nativeGraphicsTrace = Object.freeze({
		gles(operation) {
			return Object.freeze({ operation });
		},
		...(readPixels ? { readPixels } : {})
	});
	const runtimeState = Object.freeze({ nativeGraphicsTrace, nativeHeap: heap });
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, READBACK_THREAD).result;
	displayState.initialize(display, READBACK_THREAD);
	const configState = createNativeEglConfigState(displayState);
	const contextState = createNativeEglContextState(displayState, configState);
	const created = contextState.create(
		display,
		NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE,
		0n,
		[],
		READBACK_THREAD
	);
	contextState.bind(READBACK_THREAD, created.context);
	const textures = getNativeGlesTextureState(runtimeState, contextState);
	const readback = getNativeGlesReadbackState(runtimeState, contextState);
	const registry = createNativeHostImportRegistry();
	registerNativeGlesTextureImageHandlers(registry, textures);
	registerNativeGlesReadbackHandlers(registry, readback);
	return Object.freeze({
		memory: heap,
		readback,
		registers: createAarch64Registers({ programCounter: 0x7000n }),
		registry,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: READBACK_THREAD })
	});
}

/** Invokes one native GLES function using the fixture's real AAPCS64 registers. */
export function invokeReadbackGles(fixture, name, ...values) {
	fixture.registers.pc = 0x7000n;
	values.forEach((value, index) => fixture.registers.write(index, BigInt(value)));
	fixture.registers.write(30, READBACK_RETURN);
	return fixture.registry.handle({ name }, fixture);
}
