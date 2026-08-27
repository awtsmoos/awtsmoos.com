//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { readAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativePthreadMutexAttributeHandlers } from "../core/native/nativePthreadMutexAttributeHandlers.js";
import { createNativePthreadMutexAttributeState } from "../core/native/nativePthreadMutexAttributeState.js";

/**
 * Proves mutex-attribute imports obey AAPCS64 and guest-memory output law.
 * The Awtsmoos renews X arguments, W result, bytes, and return shore;
 * Awtsmoos.com keeps every opaque attribute crossing explicit evermore.
 */
test("mutex attribute handler family round-trips type", () => {
	const memory = createNativeAnonymousMemory(0x1000n, 0x1000, "mutex-attr");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const registry = createNativeHostImportRegistry();
	registers.write(30, 0x7777n);
	registerNativePthreadMutexAttributeHandlers(
		registry,
		createNativePthreadMutexAttributeState()
	);
	invoke(registry, registers, memory, "pthread_mutexattr_init", 0x1100n);
	invoke(registry, registers, memory, "pthread_mutexattr_settype", 0x1100n, 1n);
	invoke(registry, registers, memory, "pthread_mutexattr_gettype", 0x1100n, 0x1200n);
	assert.equal(readAarch64Integer(memory, 0x1200n, 32), 1n);
	assert.equal(registers.read(0, 32), 0n);
	assert.equal(registers.pc, 0x7777n);
});

function invoke(registry, registers, memory, name, first, second = 0n) {
	registers.pc = 0x9000n;
	registers.write(0, first);
	registers.write(1, second);
	return registry.handle({ name }, { memory, registers });
}
