//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativePthreadMutexHandlers } from "../core/native/nativePthreadMutexHandlers.js";
import { createNativePthreadMutexState } from "../core/native/nativePthreadMutexState.js";

/**
 * Proves pthread imports obey AAPCS64, TPIDR_EL0 identity, and C int returns.
 * The Awtsmoos recreates register, thread, mutex, and continuation anew;
 * Awtsmoos.com keeps each host boundary explicit and dependency-free.
 */
test("pthread mutex handlers register the bounded import family", () => {
	const fixture = createFixture();
	assert.deepEqual(fixture.registry.snapshot(), [
		"pthread_mutex_destroy",
		"pthread_mutex_init",
		"pthread_mutex_lock",
		"pthread_mutex_trylock",
		"pthread_mutex_unlock"
	]);
});

test("lock and unlock use X0, TPIDR_EL0, W0, and X30 exactly", () => {
	const fixture = createFixture();
	invoke(fixture, "pthread_mutex_lock", 0xa000n);
	assert.equal(fixture.registers.read(0, 64), 0n);
	assert.equal(fixture.registers.pc, 0x7777n);
	assert.equal(fixture.mutexes.snapshot()[0].owner, "43981");
	fixture.registers.pc = 0x9000n;
	invoke(fixture, "pthread_mutex_unlock", 0xa000n);
	assert.equal(fixture.registers.read(0, 32), 0n);
	assert.equal(fixture.mutexes.snapshot()[0].locked, false);
});

test("try-lock contention and nonzero attributes return C errors", () => {
	const fixture = createFixture();
	invoke(fixture, "pthread_mutex_lock", 0xb000n);
	fixture.systemRegisters.write("TPIDR_EL0", 0xdcban);
	invoke(fixture, "pthread_mutex_trylock", 0xb000n);
	assert.equal(fixture.registers.read(0, 64), 16n);
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, 0xc000n);
	fixture.registers.write(1, 0x1234n);
	fixture.registry.handle(
		Object.freeze({ name: "pthread_mutex_init" }),
		context(fixture)
	);
	assert.equal(fixture.registers.read(0, 64), 22n);
	assert.equal(fixture.registers.pc, 0x7777n);
});

function createFixture() {
	const mutexes = createNativePthreadMutexState();
	const registry = createNativeHostImportRegistry();
	registerNativePthreadMutexHandlers(registry, mutexes);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, 0x7777n);
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: 0xabcdn });
	return Object.freeze({ mutexes, registers, registry, systemRegisters });
}

function invoke(fixture, name, address) {
	fixture.registers.write(0, address);
	return fixture.registry.handle(Object.freeze({ name }), context(fixture));
}

function context(fixture) {
	return Object.freeze({
		registers: fixture.registers,
		systemRegisters: fixture.systemRegisters
	});
}
