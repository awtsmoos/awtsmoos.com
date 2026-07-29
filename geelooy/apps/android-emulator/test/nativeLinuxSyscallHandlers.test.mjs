//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeErrnoState } from "../core/native/nativeErrnoState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLinuxSyscallHandlers } from "../core/native/nativeLinuxSyscallHandlers.js";
import { createNativeLinuxPriorityState } from "../core/native/nativeLinuxPriorityState.js";
import { createNativeLinuxThreadIds } from "../core/native/nativeLinuxThreadIds.js";

const RETURN_ADDRESS = 0x7777n;
const THREAD_POINTER = 0x12345000n;

/**
 * Proves deterministic guest TIDs and priority records cross the AArch64 ABI.
 * The Awtsmoos renews identity, nice value, errno, and return shore in light;
 * Awtsmoos.com changes no host scheduler while guest testimony remains right.
 */
test("AArch64 gettid returns a stable positive guest tid", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 178n, 32, "zero");
	const first = invoke(fixture, "syscall");
	assert.equal(first.result.syscall, "gettid");
	assert.equal(first.result.result, 1000n);
	assert.equal(fixture.registers.read(0), 1000n);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	fixture.registers.write(0, 178n, 32, "zero");
	assert.equal(invoke(fixture, "syscall").result.result, 1000n);
});

test("distinct TPIDR_EL0 values receive distinct deterministic tids", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 178n, 32, "zero");
	assert.equal(invoke(fixture, "syscall").result.result, 1000n);
	fixture.systemRegisters.write("TPIDR_EL0", 0x12346000n);
	fixture.registers.write(0, 178n, 32, "zero");
	assert.equal(invoke(fixture, "syscall").result.result, 1001n);
});

test("setpriority records current-thread nice values and clamps bounds", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 0n, 32, "zero");
	fixture.registers.write(1, 0n, 32, "zero");
	fixture.registers.write(2, BigInt.asUintN(32, -5n), 32, "zero");
	const handled = invoke(fixture, "setpriority");
	assert.equal(handled.result.result, 0);
	assert.equal(handled.result.currentTid, 1000n);
	assert.equal(handled.result.applied, -5);
	assert.equal(fixture.priorityState.lookup(0, 1000).applied, -5);
	fixture.registers.write(0, 0n, 32, "zero");
	fixture.registers.write(1, 1000n, 32, "zero");
	fixture.registers.write(2, 99n, 32, "zero");
	assert.equal(invoke(fixture, "setpriority").result.applied, 19);
});

test("invalid priority selector returns minus one and sets errno", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 9n, 32, "zero");
	fixture.registers.write(1, 0n, 32, "zero");
	fixture.registers.write(2, 0n, 32, "zero");
	const handled = invoke(fixture, "setpriority");
	assert.equal(handled.result.result, -1);
	assert.equal(fixture.registers.read(0, 32), 0xffffffffn);
	assert.equal(fixture.errnoState.get(THREAD_POINTER), 22);
});

test("unsupported syscall numbers fail explicitly without advancing PC", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 999n, 32, "zero");
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	assert.throws(() => fixture.registry.handle({ name: "syscall" }, fixture), error => {
		assert.equal(error.code, "NATIVE_LINUX_SYSCALL_UNSUPPORTED");
		assert.equal(error.syscallNumber, 999);
		return true;
	});
	assert.equal(fixture.registers.pc, 0x9000n);
});

test("registry exposes syscall and setpriority exactly once", () => {
	const fixture = createFixture();
	for (const name of ["syscall", "setpriority"]) {
		assert.equal(fixture.registry.snapshot().filter(item => item === name).length, 1);
	}
});

function createFixture() {
	const registry = createNativeHostImportRegistry();
	const threadIds = createNativeLinuxThreadIds();
	const priorityState = createNativeLinuxPriorityState();
	const errnoState = createNativeErrnoState(createNativeHeap(0x7000n, 0x1000));
	registerNativeLinuxSyscallHandlers(registry, threadIds, errnoState, priorityState);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD_POINTER });
	return { errnoState, priorityState, registers, registry, systemRegisters };
}

function invoke(fixture, name) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}
