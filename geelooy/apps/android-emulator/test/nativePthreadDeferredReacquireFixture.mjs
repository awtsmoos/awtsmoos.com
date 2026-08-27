//B"H
//Boruch Hashem
//Blessed is He

import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import { NATIVE_PTHREAD_RETURN } from "../core/native/nativePthreadChildMachine.js";
import { registerNativePthreadMutexHandlers } from "../core/native/nativePthreadMutexHandlers.js";
import { createNativePthreadMutexState } from "../core/native/nativePthreadMutexState.js";
import { createNativePthreadScheduler } from "../core/native/nativePthreadScheduler.js";
import { createNativePthreadThreadState } from "../core/native/nativePthreadThreadState.js";

export const MAIN = 0x5000n;
export const FIRST = 0x6000n;
export const SECOND = 0x7000n;
export const MUTEX = 0x2200n;

/**
 * Builds retained guest threads for deferred condition-mutex handoff tests.
 * The Awtsmoos renews fixture, continuation, owner, and unlock returning ray;
 * Awtsmoos.com keeps infrastructure apart from each measured assertion way.
 */
export function createDeferredReacquireFixture(handles) {
	const memory = createMachineMemory();
	const threads = createNativePthreadThreadState();
	const mutexes = createNativePthreadMutexState();
	mutexes.initialize(MUTEX, 0n);
	handles.forEach(handle => suspendThread(threads, handle));
	const registry = createNativeHostImportRegistry();
	const scheduler = createNativePthreadScheduler({
		machineState: { imports: createNativeImportAddressSpace(), memory },
		mutexes,
		registry,
		threads
	});
	registerNativePthreadMutexHandlers(registry, { mutexes, scheduler });
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, 0x7777n);
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: MAIN });
	return { mutexes, registers, registry, scheduler, systemRegisters, threads };
}

export function unlockDeferredMutex(fixture, owner) {
	fixture.systemRegisters.write("TPIDR_EL0", owner);
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, MUTEX);
	fixture.registers.write(30, 0x7777n);
	return fixture.registry.handle({ name: "pthread_mutex_unlock" }, fixture);
}

function suspendThread(threads, handle) {
	threads.create({ argument: 0n, handle, stackBase: 0x3000n,
		stackSize: 0x1000n, startRoutine: 0x1100n, threadPointer: handle });
	const registers = createAarch64Registers({ programCounter: 0x1100n });
	registers.write(0, handle);
	registers.write(30, NATIVE_PTHREAD_RETURN);
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: handle });
	const child = { report: { reason: "pthread-suspended" }, returnValue: "0",
		suspension: { condition: "8704", mutex: MUTEX.toString(), thread: handle.toString() } };
	Object.defineProperty(child, "continuation", {
		enumerable: false,
		value: Object.freeze({ registers, systemRegisters })
	});
	threads.suspend(handle, Object.freeze(child));
}

function createMachineMemory() {
	const region = createNativeAnonymousMemory(0x1000n, 0x4000, "deferred-reacquire");
	region.write(0x1100n, Uint8Array.of(0xc0, 0x03, 0x5f, 0xd6));
	return Object.freeze({
		read: (address, size) => region.read(address, size),
		readU32(address) {
			const bytes = region.read(address, 4);
			return new DataView(bytes.buffer, bytes.byteOffset, 4).getUint32(0, true);
		},
		write: (address, bytes) => region.write(address, bytes)
	});
}
