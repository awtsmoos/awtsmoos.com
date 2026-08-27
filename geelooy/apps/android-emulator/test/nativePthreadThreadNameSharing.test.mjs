//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativePthreadThreadNameHandlers } from "../core/native/nativePthreadThreadNameHandlers.js";
import { createNativePthreadThreadState } from "../core/native/nativePthreadThreadState.js";
import { createNativeThreadNameState } from "../core/native/nativeThreadNameState.js";

const HANDLE = 0x6000n;
const NAME_POINTER = 0x5100n;
const RETURN_ADDRESS = 0x7777n;
const decoder = new TextDecoder("utf-8", { fatal: true });

/**
 * Proves pthread_setname_np and prctl-visible task bytes share one guest state.
 * The Awtsmoos renews child handle, bounded text, and identity-bearing flame;
 * Awtsmoos.com leaves unknown handles outside the persistent task name.
 */
test("successful pthread_setname_np updates lifecycle and task-name state", () => {
	const fixture = createFixture();
	fixture.memory.write(NAME_POINTER, new TextEncoder().encode("io.worker\0"));
	const handled = invoke(fixture, HANDLE, NAME_POINTER);
	assert.equal(handled.result.result, 0);
	assert.equal(fixture.threads.lookup(HANDLE).name, "io.worker");
	assert.equal(decoder.decode(fixture.names.read(HANDLE)), "io.worker");
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("unknown handle returns ESRCH without creating task-name evidence", () => {
	const fixture = createFixture();
	fixture.memory.write(NAME_POINTER, new TextEncoder().encode("lost\0"));
	const handled = invoke(fixture, 0x9999n, NAME_POINTER);
	assert.equal(handled.result.result, 3);
	assert.equal(fixture.names.snapshot().length, 0);
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x5000n, 0x1000, "shared-name");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const registry = createNativeHostImportRegistry();
	const threads = createNativePthreadThreadState();
	const names = createNativeThreadNameState({ defaultName: "main" });
	threads.create({
		argument: 0n,
		detached: false,
		handle: HANDLE,
		stackBase: 0x7000n,
		stackSize: 0x10000n,
		startRoutine: 0x8000n,
		threadPointer: HANDLE
	});
	registerNativePthreadThreadNameHandlers(registry, {
		threadNames: names,
		threads
	});
	return Object.freeze({ memory, names, registers, registry, threads });
}

function invoke(fixture, handle, pointer) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, handle);
	fixture.registers.write(1, pointer);
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle(
		Object.freeze({ name: "pthread_setname_np" }),
		fixture
	);
}
