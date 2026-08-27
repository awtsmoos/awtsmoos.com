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
import { createNativeLinuxPriorityState } from "../core/native/nativeLinuxPriorityState.js";
import { registerNativeLinuxSyscallHandlers } from "../core/native/nativeLinuxSyscallHandlers.js";
import { createNativeLinuxThreadIds } from "../core/native/nativeLinuxThreadIds.js";

const THREAD = 0x5000n;
const RETURN_ADDRESS = 0x7777n;

test("authentic setpriority stores nice minus five and preserves ABI", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 0n, 32, "zero");
	fixture.registers.write(1, 0n, 32, "zero");
	fixture.registers.write(2, 0xfffffffbn, 32, "zero");
	fixture.registers.write(5, 0xabcden);
	const handled = invoke(fixture);
	assert.equal(handled.result.requested, -5);
	assert.equal(handled.result.applied, -5);
	assert.equal(handled.result.result, 0);
	assert.equal(fixture.priorityState.lookup(0, 1000).applied, -5);
	assert.equal(fixture.registers.read(0, 32), 0n);
	assert.equal(fixture.registers.read(5), 0xabcden);
	assert.equal(fixture.registers.sp, 0x8800n);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("invalid which returns minus one and sets per-thread EINVAL", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 9n, 32, "zero");
	fixture.registers.write(1, 0n, 32, "zero");
	fixture.registers.write(2, 0n, 32, "zero");
	const handled = invoke(fixture);
	assert.equal(handled.result.result, -1);
	assert.equal(handled.result.errno, 22);
	assert.equal(fixture.registers.read(0, 32), 0xffffffffn);
	assert.equal(fixture.errnoState.get(THREAD), 22);
});

function createFixture() {
	const registry = createNativeHostImportRegistry();
	const threadIds = createNativeLinuxThreadIds();
	const priorityState = createNativeLinuxPriorityState();
	const errnoState = createNativeErrnoState(createNativeHeap(0x7000n, 0x1000));
	registerNativeLinuxSyscallHandlers(registry, threadIds, errnoState, priorityState);
	const registers = createAarch64Registers({ programCounter: 0x9000n, stackPointer: 0x8800n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	return { errnoState, priorityState, registers, registry, systemRegisters };
}

function invoke(fixture) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name: "setpriority" }, fixture);
}
