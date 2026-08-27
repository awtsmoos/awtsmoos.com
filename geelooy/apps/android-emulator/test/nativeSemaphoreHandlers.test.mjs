//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeErrnoState } from "../core/native/nativeErrnoState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeSemaphoreHandlers } from "../core/native/nativeSemaphoreHandlers.js";
import { createNativeSemaphoreState, NATIVE_SEMAPHORE_VALUES } from "../core/native/nativeSemaphoreState.js";

const THREAD = 0x5000n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves guest semaphore imports preserve memory, errno, and AAPCS64 truth.
 * The Awtsmoos renews token, stack byte, thread, and returning shore;
 * Awtsmoos.com leaves every blocked wait unchanged at the scheduler door.
 */
test("authentic sem_init writes count two and preserves surrounding bytes", () => {
	const fixture = createFixture();
	fixture.registers.write(5, 0xabcden);
	const handled = invoke(fixture, "sem_init", fixture.semaphore, 0, 2);
	assert.equal(handled.result.count, 2);
	assert.deepEqual([...fixture.heap.read(fixture.block, 16)], [
		0xaa, 0xaa, 0xaa, 0xaa, 2, 0, 0, 0,
		0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa
	]);
	assert.equal(fixture.registers.read(0, 32), 0n);
	assert.equal(fixture.registers.read(5), 0xabcden);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("wait, post, get-value, and try-wait use guest memory and errno", () => {
	const fixture = createFixture();
	invoke(fixture, "sem_init", fixture.semaphore, 0, 2);
	invoke(fixture, "sem_wait", fixture.semaphore);
	invoke(fixture, "sem_wait", fixture.semaphore);
	const output = fixture.heap.allocate(4n);
	invoke(fixture, "sem_getvalue", fixture.semaphore, output);
	assert.deepEqual([...fixture.heap.read(output, 4)], [0, 0, 0, 0]);
	const failed = invoke(fixture, "sem_trywait", fixture.semaphore);
	assert.equal(failed.result.errno, NATIVE_SEMAPHORE_VALUES.EAGAIN);
	assert.equal(fixture.registers.read(0, 32), 0xffffffffn);
	assert.equal(fixture.errnoState.get(THREAD), NATIVE_SEMAPHORE_VALUES.EAGAIN);
	invoke(fixture, "sem_post", fixture.semaphore);
	assert.deepEqual([...fixture.heap.read(fixture.semaphore, 4)], [1, 0, 0, 0]);
});

test("zero-count sem_wait throws before memory, registers, or PC change", () => {
	const fixture = createFixture();
	invoke(fixture, "sem_init", fixture.semaphore, 0, 0);
	fixture.registers.pc = 0x8888n;
	fixture.registers.write(0, fixture.semaphore);
	fixture.registers.write(5, 0x5555n);
	fixture.registers.write(30, RETURN_ADDRESS);
	const before = [...fixture.heap.read(fixture.block, 16)];
	assert.throws(() => fixture.registry.handle({ name: "sem_wait" }, fixture), error => {
		assert.equal(error.code, "NATIVE_SEMAPHORE_WOULD_BLOCK");
		return true;
	});
	assert.deepEqual([...fixture.heap.read(fixture.block, 16)], before);
	assert.equal(fixture.registers.read(0), fixture.semaphore);
	assert.equal(fixture.registers.read(5), 0x5555n);
	assert.equal(fixture.registers.pc, 0x8888n);
});

test("destroy clears storage and production registry exposes each import once", () => {
	const fixture = createFixture();
	invoke(fixture, "sem_init", fixture.semaphore, 0, 4);
	invoke(fixture, "sem_destroy", fixture.semaphore);
	assert.deepEqual([...fixture.heap.read(fixture.semaphore, 4)], [0, 0, 0, 0]);
	const production = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	for (const name of ["sem_init", "sem_destroy", "sem_post", "sem_wait", "sem_trywait", "sem_getvalue"]) {
		assert.equal(production.snapshot().filter(value => value === name).length, 1);
	}
});

function createFixture() {
	const heap = createNativeHeap(0x1000n, 0x10000);
	const block = heap.allocate(16n);
	heap.write(block, new Uint8Array(16).fill(0xaa));
	const errnoState = createNativeErrnoState(heap);
	const registry = createNativeHostImportRegistry();
	registerNativeSemaphoreHandlers(registry, {
		errnoState,
		semaphores: createNativeSemaphoreState()
	});
	return {
		block,
		errnoState,
		heap,
		memory: heap,
		registers: createAarch64Registers({ programCounter: 0x8888n }),
		registry,
		semaphore: block + 4n,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: THREAD })
	};
}

function invoke(fixture, name, ...values) {
	fixture.registers.pc = 0x8888n;
	values.forEach((value, index) => fixture.registers.write(index, value));
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}
