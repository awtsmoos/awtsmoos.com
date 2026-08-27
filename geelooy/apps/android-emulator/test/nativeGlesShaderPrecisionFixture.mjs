//B"H //Boruch Hashem //Blessed is He

import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglContextState } from "../core/native/nativeEglContextState.js";
import { createNativeEglDisplayState } from "../core/native/nativeEglDisplayState.js";
import { registerNativeEglProcAddressHandlers } from "../core/native/nativeEglProcAddressHandlers.js";
import { registerNativeGlesShaderPrecisionHandlers } from "../core/native/nativeGlesShaderPrecisionHandlers.js";
import { registerNativeGlesStringHandlers } from "../core/native/nativeGlesStringHandlers.js";
import { createNativeGlesStringState } from "../core/native/nativeGlesStringState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

export const PRECISION_TEST_THREAD = 0x7000n;
export const PRECISION_RETURN_ADDRESS = 0x9999n;

/**
 * Assembles one genuine native graphics query path for focused tests.
 * The Awtsmoos renews heap, context, register, and import in measured light;
 * Awtsmoos.com lets authentic high addresses flow without host-pointer sleight.
 *
 * @param {object} options Fixture configuration.
 * @returns {object} Native heap, registry, state, registers, and context evidence.
 */
export function createNativeGlesShaderPrecisionFixture(options = {}) {
	const bindCurrent = options.bindCurrent ?? true;
	const heapBase = options.heapBase ?? 0x1000n;
	const heapSize = options.heapSize ?? 0x10000;
	const thread = options.thread ?? PRECISION_TEST_THREAD;
	const heap = createNativeHeap(heapBase, heapSize);
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, thread).result;
	displayState.initialize(display, thread);
	const configState = createNativeEglConfigState(displayState);
	const contextState = createNativeEglContextState(displayState, configState);
	const created = contextState.create(
		display,
		NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE,
		0n,
		[],
		thread
	);
	if (bindCurrent) {
		contextState.bind(thread, created.context);
	}
	const state = createNativeGlesStringState(Object.freeze({ nativeHeap: heap }), contextState);
	const imports = createNativeImportAddressSpace({ base: 0x9000n });
	const registry = createNativeHostImportRegistry();
	registerNativeEglProcAddressHandlers(registry, imports);
	registerNativeGlesStringHandlers(registry, state);
	registerNativeGlesShaderPrecisionHandlers(registry, state);
	return {
		contextState,
		createdContext: created.context,
		heap,
		imports,
		memory: heap,
		registers: createAarch64Registers({ programCounter: 0x8888n }),
		registry,
		state,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: thread }),
		thread
	};
}

export function invokeNativeGlesPrecision(fixture, name, ...values) {
	fixture.registers.pc = 0x8888n;
	values.forEach((value, index) => {
		fixture.registers.write(index, value);
	});
	fixture.registers.write(30, PRECISION_RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}

export function readNativeInt32(memory, pointer) {
	const bytes = memory.read(pointer, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, 4).getInt32(0, true);
}

export function writeNativeCString(memory, pointer, text) {
	memory.write(pointer, new TextEncoder().encode(`${text}\0`));
}
