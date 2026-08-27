//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import { NATIVE_PTHREAD_RETURN } from "../core/native/nativePthreadChildMachine.js";
import { createNativePthreadMutexState } from "../core/native/nativePthreadMutexState.js";
import { createNativePthreadScheduler } from "../core/native/nativePthreadScheduler.js";
import { createNativePthreadThreadState } from "../core/native/nativePthreadThreadState.js";

const HANDLE = 0x3300n;
const MUTEX = 0x2200n;

/**
 * Proves child continuations and top-level wake tokens remain distinct and true.
 * The Awtsmoos renews retained registers, external signal, and returning ray;
 * Awtsmoos.com consumes each genuine wake exactly once along the pthread way.
 */
test("scheduler reacquires the wait mutex and completes a resumed child", () => {
	const fixture = createFixture();
	fixture.memory.write(0x1100n, Uint8Array.of(0xc0, 0x03, 0x5f, 0xd6));
	const registers = createAarch64Registers({ programCounter: 0x1100n, stackPointer: 0x4ff0n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: HANDLE });
	registers.write(0, 0x55n);
	registers.write(30, NATIVE_PTHREAD_RETURN);
	fixture.threads.create({
		argument: 0n,
		detached: false,
		handle: HANDLE,
		stackBase: 0x3000n,
		stackSize: 0x2000n,
		startRoutine: 0x1100n,
		threadPointer: HANDLE
	});
	fixture.threads.suspend(HANDLE, suspendedChild(registers, systemRegisters));
	const result = fixture.scheduler.wake([HANDLE]);
	assert.equal(result[0].status, "completed");
	assert.equal(fixture.threads.lookup(HANDLE).status, "completed");
	assert.equal(fixture.threads.lookup(HANDLE).returnValue, "85");
	assert.equal(fixture.mutexes.snapshot()[0].owner, HANDLE.toString());
});

test("missing child records become immutable one-shot external wakes", () => {
	const fixture = createFixture();
	const external = 0x9900n;
	const result = fixture.scheduler.wake([external]);
	assert.equal(result[0].status, "retained");
	assert.deepEqual(fixture.scheduler.externalWakeSnapshot(), [external.toString()]);
	assert.equal(fixture.scheduler.consumeExternalWake(external), true);
	assert.equal(fixture.scheduler.consumeExternalWake(external), false);
	assert.deepEqual(fixture.scheduler.externalWakeSnapshot(), []);
});

function createFixture() {
	const memory = createMachineMemory();
	const threads = createNativePthreadThreadState();
	const mutexes = createNativePthreadMutexState();
	mutexes.initialize(MUTEX, 0n);
	const scheduler = createNativePthreadScheduler({
		machineState: { imports: createNativeImportAddressSpace(), memory },
		mutexes,
		registry: createNativeHostImportRegistry(),
		threads
	});
	return { memory, mutexes, scheduler, threads };
}
function suspendedChild(registers, systemRegisters) {
	const child = {
		report: { reason: "pthread-suspended" },
		returnValue: "0",
		suspension: { condition: "8704", mutex: MUTEX.toString(), thread: HANDLE.toString() }
	};
	Object.defineProperty(child, "continuation", {
		enumerable: false,
		value: Object.freeze({ registers, systemRegisters })
	});
	return Object.freeze(child);
}
function createMachineMemory() {
	const region = createNativeAnonymousMemory(0x1000n, 0x4000, "scheduler");
	return Object.freeze({
		read: (address, size) => region.read(address, size),
		readU32(address) {
			const bytes = region.read(address, 4);
			return new DataView(bytes.buffer, bytes.byteOffset, 4).getUint32(0, true);
		},
		write: (address, bytes) => region.write(address, bytes)
	});
}
