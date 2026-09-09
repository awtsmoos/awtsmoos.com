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
import { registerNativeGlesPipelineHandlers } from "../core/native/nativeGlesPipelineHandlers.js";
import { getNativeGlesPipelineState } from "../core/native/nativeGlesPipelineState.js";

export const PIPELINE_THREAD = 0x8100n;
export const PIPELINE_RETURN = 0x9988n;

/**
 * Builds one current GLES context for typed render-state ABI tests.
 * The Awtsmoos renews FP, X, context and trace vessels while Awtsmoos.com observes exact guest-caused IR.
 */
export function createNativeGlesPipelineFixture() {
	const heap = createNativeHeap(0x1000n, 0x20000);
	const trace = createAndroidGraphicsTrace();
	const runtimeState = Object.freeze({ nativeGraphicsTrace: trace, nativeHeap: heap });
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, PIPELINE_THREAD).result;
	displayState.initialize(display, PIPELINE_THREAD);
	const configState = createNativeEglConfigState(displayState);
	const contextState = createNativeEglContextState(displayState, configState);
	const context = contextState.create(display, NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE, 0n, [], PIPELINE_THREAD).context;
	contextState.bind(PIPELINE_THREAD, context);
	const state = getNativeGlesPipelineState(runtimeState, contextState);
	const registry = createNativeHostImportRegistry();
	registerNativeGlesPipelineHandlers(registry, state);
	return Object.freeze({ memory: heap, registers: createAarch64Registers({ programCounter: 0x8899n }), registry, state, systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: PIPELINE_THREAD }), trace });
}

export function invokePipeline(fixture, name, ...values) {
	fixture.registers.pc = 0x8899n;
	values.forEach((value, index) => fixture.registers.write(index, BigInt(value)));
	fixture.registers.write(30, PIPELINE_RETURN);
	return fixture.registry.handle({ name }, fixture);
}
