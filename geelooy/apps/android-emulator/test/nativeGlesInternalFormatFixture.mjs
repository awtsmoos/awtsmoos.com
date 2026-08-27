//B"H //Boruch Hashem //Blessed is He

import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglContextState } from "../core/native/nativeEglContextState.js";
import { createNativeEglDisplayState } from "../core/native/nativeEglDisplayState.js";
import { registerNativeEglProcAddressHandlers } from "../core/native/nativeEglProcAddressHandlers.js";
import { registerNativeGlesInternalFormatHandlers } from "../core/native/nativeGlesInternalFormatHandlers.js";
import { registerNativeGlesStringHandlers } from "../core/native/nativeGlesStringHandlers.js";
import { createNativeGlesStringState } from "../core/native/nativeGlesStringState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

export const INTERNAL_FORMAT_RETURN_ADDRESS = 0x9999n;
export const INTERNAL_FORMAT_THREAD = 0x7000n;

/**
 * Assembles one genuine AArch64 GLES internal-format query path.
 * The Awtsmoos renews heap, context, import, and register in measured light;
 * Awtsmoos.com lets high guest pointers flow without host-pointer sleight.
 */
export function createNativeGlesInternalFormatFixture(options = {}) {
	const bindCurrent = options.bindCurrent ?? true;
	const heap = createNativeHeap(options.heapBase ?? 0x1000n, options.heapSize ?? 0x10000);
	const thread = options.thread ?? INTERNAL_FORMAT_THREAD;
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
	registerNativeGlesInternalFormatHandlers(registry, state);
	return {
		heap,
		imports,
		memory: heap,
		registers: createAarch64Registers({ programCounter: 0x8888n }),
		registry,
		state,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: thread })
	};
}

export function invokeNativeGlesInternalFormat(fixture, name, ...values) {
	fixture.registers.pc = 0x8888n;
	values.forEach((value, index) => {
		fixture.registers.write(index, value);
	});
	fixture.registers.write(30, INTERNAL_FORMAT_RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}

export function readNativeInt32(memory, pointer) {
	const bytes = memory.read(pointer, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, 4).getInt32(0, true);
}

export function writeNativeCString(memory, pointer, text) {
	memory.write(pointer, new TextEncoder().encode(`${text}\0`));
}
