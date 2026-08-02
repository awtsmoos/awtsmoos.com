//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import { createNativePthreadMutexState } from "../core/native/nativePthreadMutexState.js";
import { createNativePthreadScheduler } from "../core/native/nativePthreadScheduler.js";
import { registerNativePthreadThreadHandlers } from "../core/native/nativePthreadThreadHandlers.js";
import { createNativePthreadThreadState } from "../core/native/nativePthreadThreadState.js";

const CODE = 0x1100n;
const OUTPUT = 0x1200n;
const RETURN_OUTPUT = 0x1210n;
const PARENT_RETURN = 0x7777n;

/**
 * Proves pthread creation returns before real child execution and join may drain.
 * The Awtsmoos renews parent, runnable child, shared memory, and returning ray;
 * Awtsmoos.com opens execution only at the cooperative join gateway.
 */
test("pthread_create defers a real AArch64 child until pthread_join", () => {
	const fixture = createFixture();
	fixture.registers.write(0, OUTPUT);
	fixture.registers.write(1, 0n);
	fixture.registers.write(2, CODE);
	fixture.registers.write(3, 0x55n);
	invoke(fixture, "pthread_create");
	const handle = readU64(fixture.memory, OUTPUT);
	assert.notEqual(handle, 0n);
	assert.equal(fixture.threads.lookup(handle).status, "runnable");
	assert.equal(fixture.scheduler.runnableSnapshot()[0].handle, handle.toString());
	assert.equal(fixture.registers.pc, PARENT_RETURN);
	fixture.registers.write(0, handle);
	fixture.registers.write(1, RETURN_OUTPUT);
	const joined = invoke(fixture, "pthread_join");
	assert.equal(joined.result.result, 0);
	assert.equal(joined.result.runnableResult.status, "completed");
	assert.equal(readU64(fixture.memory, RETURN_OUTPUT), 0x55n);
	assert.equal(fixture.threads.lookup(handle).status, "completed");
});

function createFixture() {
	const heap = createNativeHeap(0x1000n, 0x300000);
	heap.allocate(0x1000n);
	heap.write(CODE, Uint8Array.of(0xc0, 0x03, 0x5f, 0xd6));
	const memory = Object.freeze({
		...heap,
		readU32(address) {
			const bytes = heap.read(address, 4);
			return new DataView(bytes.buffer, bytes.byteOffset, 4).getUint32(0, true);
		}
	});
	const threads = createNativePthreadThreadState();
	const registry = createNativeHostImportRegistry();
	const machineState = Object.freeze({
		imports: createNativeImportAddressSpace(),
		memory,
		nativeHeap: heap
	});
	const scheduler = createNativePthreadScheduler({
		machineState,
		mutexes: createNativePthreadMutexState(),
		registry,
		threads
	});
	registerNativePthreadThreadHandlers(registry, {
		attributes: {},
		machineState,
		scheduler,
		threads
	});
	return {
		memory,
		registers: createAarch64Registers({ programCounter: 0x9000n }),
		registry,
		scheduler,
		threads
	};
}

function invoke(fixture, name) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, PARENT_RETURN);
	return fixture.registry.handle({ name }, fixture);
}

function readU64(memory, address) {
	const bytes = memory.read(address, 8);
	return new DataView(bytes.buffer, bytes.byteOffset, 8).getBigUint64(0, true);
}
