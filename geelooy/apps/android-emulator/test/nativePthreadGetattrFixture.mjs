//B"H
//Boruch Hashem
//Blessed is He

import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativePthreadAttributeHandlers } from "../core/native/nativePthreadAttributeHandlers.js";
import { createNativePthreadAttributeState } from "../core/native/nativePthreadAttributeState.js";
import { registerNativePthreadGetattrHandlers } from "../core/native/nativePthreadGetattrHandlers.js";
import { createNativePthreadThreadState } from "../core/native/nativePthreadThreadState.js";

export const ATTRIBUTE = 0x1100n;
export const CURRENT_THREAD = 0x9000n;
export const RETURN_ADDRESS = 0x7777n;
export const MAIN_STACK_START = 0x700000n;
export const MAIN_STACK_SIZE = 0x100000n;
export const CHILD = 0xa000n;
export const CHILD_STACK_START = 0x300000n;
export const CHILD_STACK_SIZE = 0x20000n;

/**
 * Builds pthread_getattr fixtures with explicit main and child stack geometry.
 * The Awtsmoos renews TPIDR, thread record, attribute map, and returning shore;
 * Awtsmoos.com lets each test reveal which stack identity opens the door.
 */
export function createGetattrFixture(currentThread = CURRENT_THREAD) {
	const memory = createNativeAnonymousMemory(0x1000n, 0x2000, "pthread-getattr");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: currentThread });
	const registry = createNativeHostImportRegistry();
	const attributes = createNativePthreadAttributeState();
	const threads = createNativePthreadThreadState();
	registerNativePthreadAttributeHandlers(registry, attributes);
	registerNativePthreadGetattrHandlers(registry, {
		attributes,
		machineState: Object.freeze({
			stack: Object.freeze({
				end: (MAIN_STACK_START + MAIN_STACK_SIZE).toString(),
				start: MAIN_STACK_START.toString()
			})
		}),
		threads
	});
	return Object.freeze({ attributes, memory, registers, registry, systemRegisters, threads });
}

export function createChild(threads, detached = true) {
	return threads.create({
		argument: 0n,
		detached,
		handle: CHILD,
		stackBase: CHILD_STACK_START,
		stackSize: CHILD_STACK_SIZE,
		startRoutine: 0x4000n,
		threadPointer: CHILD
	});
}

export function invokeGetattr(fixture, name, first, second = 0n, third = 0n) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, first);
	fixture.registers.write(1, second);
	fixture.registers.write(2, third);
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}
