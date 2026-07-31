//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLinuxSyscallHandlers } from "../core/native/nativeLinuxSyscallHandlers.js";
import { createNativeLinuxThreadIds } from "../core/native/nativeLinuxThreadIds.js";

const MAIN_THREAD = 0x6fffe0000000n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves PID equals the process leader TID while child TIDs remain distinct.
 * The Awtsmoos renews process leader and child identity in deterministic light;
 * Awtsmoos.com reveals no host PID through the guest AArch64 sight.
 */
test("leader PID, parent PID, and child TIDs share one identity state", () => {
	const ids = createNativeLinuxThreadIds({
		firstTid: 2000n,
		parentPid: 7n,
		processThreadPointer: MAIN_THREAD
	});
	assert.equal(ids.processId(), 2000n);
	assert.equal(ids.resolve(MAIN_THREAD), 2000n);
	assert.equal(ids.parentProcessId(), 7n);
	assert.equal(ids.resolve(MAIN_THREAD + 0x1000n), 2001n);
});

test("direct getpid, getppid, and gettid obey X0 and X30", () => {
	const fixture = createFixture();
	assert.equal(invoke(fixture, "getpid").result.result, 1000n);
	assert.equal(fixture.registers.read(0), 1000n);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	assert.equal(invoke(fixture, "getppid").result.result, 1n);
	assert.equal(invoke(fixture, "gettid").result.result, 1000n);
	fixture.systemRegisters.write("TPIDR_EL0", MAIN_THREAD + 0x1000n);
	assert.equal(invoke(fixture, "gettid").result.result, 1001n);
	assert.equal(invoke(fixture, "getpid").result.result, 1000n);
});

test("direct identity symbols are each exposed exactly once", () => {
	const fixture = createFixture();
	for (const name of ["getpid", "getppid", "gettid"]) {
		assert.equal(fixture.registry.snapshot().filter(value => value === name).length, 1);
	}
});

function createFixture() {
	const registry = createNativeHostImportRegistry();
	const ids = createNativeLinuxThreadIds({ processThreadPointer: MAIN_THREAD });
	registerNativeLinuxSyscallHandlers(registry, ids);
	return Object.freeze({
		registers: createAarch64Registers({ programCounter: 0x9000n }),
		registry,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: MAIN_THREAD })
	});
}

function invoke(fixture, name) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}
