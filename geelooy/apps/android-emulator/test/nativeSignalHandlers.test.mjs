//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeSignalHandlers } from "../core/native/nativeSignalHandlers.js";
import { hasNativeSignal, readNativeSignalSet } from "../core/native/nativeSignalSet.js";

const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x5000n;

test("signal handlers initialize, mutate, query, and apply thread masks", () => {
	const fixture = createFixture();
	invoke(fixture, "sigemptyset", 0x1100n);
	invoke(fixture, "sigaddset", 0x1100n, 2n);
	assert.equal(invoke(fixture, "sigismember", 0x1100n, 2n).result.result, 1);
	assert.equal(invoke(fixture, "pthread_sigmask", 0n, 0x1100n, 0x1200n).result.result, 0);
	assert.equal(hasNativeSignal(readNativeSignalSet(fixture.memory, 0x1200n), 2), false);
	assert.equal(invoke(fixture, "pthread_sigmask", 99n, 0x1100n).result.result, 22);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("registry exposes every signal road once", () => {
	const names = createFixture().registry.snapshot();
	for (const name of [
		"sigemptyset", "sigfillset", "sigaddset", "sigdelset",
		"sigismember", "pthread_sigmask", "sigprocmask"
	]) assert.equal(names.filter(item => item === name).length, 1);
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x1000n, 0x2000, "signals");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	const registry = createNativeHostImportRegistry();
	registerNativeSignalHandlers(registry, {}, null);
	return { memory, registers, registry, systemRegisters };
}

function invoke(fixture, name, first = 0n, second = 0n, third = 0n) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, first);
	fixture.registers.write(1, second);
	fixture.registers.write(2, third);
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}
