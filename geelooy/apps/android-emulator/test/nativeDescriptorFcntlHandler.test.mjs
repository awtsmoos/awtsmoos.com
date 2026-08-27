//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import {
	createNativeDescriptorFlagState,
	NATIVE_DESCRIPTOR_ACCESS,
	NATIVE_DESCRIPTOR_CLOEXEC_CREATE,
	NATIVE_DESCRIPTOR_NONBLOCK
} from "../core/native/nativeDescriptorFlagState.js";
import { createNativeErrnoState } from "../core/native/nativeErrnoState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeTimerFdDescriptorHandlers } from "../core/native/nativeTimerFdDescriptorHandlers.js";

const DESCRIPTOR = 0x40010000n;
const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x5000n;

/**
 * Proves fcntl reloads its descriptor argument across result-bearing ABI calls.
 * The Awtsmoos renews X0 input, W0 output, flags, errno, and returning shore;
 * Awtsmoos.com tests guest truth without carrying stale register results evermore.
 */
test("fcntl gets and sets authentic pipe status and descriptor flags", () => {
	const fixture = createFixture();
	fixture.flags.create(DESCRIPTOR, {
		accessMode: NATIVE_DESCRIPTOR_ACCESS.READ_ONLY,
		flags: NATIVE_DESCRIPTOR_CLOEXEC_CREATE
	});
	assert.equal(invoke(fixture, DESCRIPTOR, 3).result.result, 0);
	assert.equal(invoke(fixture, DESCRIPTOR, 4, NATIVE_DESCRIPTOR_NONBLOCK).result.result, 0);
	assert.equal(invoke(fixture, DESCRIPTOR, 3).result.result, NATIVE_DESCRIPTOR_NONBLOCK);
	assert.equal(invoke(fixture, DESCRIPTOR, 1).result.result, 1);
	assert.equal(invoke(fixture, DESCRIPTOR, 2, 0).result.result, 0);
	assert.equal(invoke(fixture, DESCRIPTOR, 1).result.result, 0);
});

test("fcntl rejects unknown descriptors and commands with errno", () => {
	const fixture = createFixture();
	assert.equal(invoke(fixture, 99n, 3).result.errno, 9);
	fixture.flags.create(DESCRIPTOR, { accessMode: 0, flags: 0 });
	assert.equal(invoke(fixture, DESCRIPTOR, 99).result.errno, 22);
});

function createFixture() {
	const flags = createNativeDescriptorFlagState();
	const errnoState = createNativeErrnoState(createNativeHeap(0x7000n, 0x1000));
	const registry = createNativeHostImportRegistry();
	const state = { close() { return false; }, has() { return false; } };
	registerNativeTimerFdDescriptorHandlers(registry, {
		descriptorFlags: flags,
		errnoState,
		state
	});
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	return { flags, registers, registry, systemRegisters };
}

function invoke(fixture, descriptor, command, argument = 0) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, BigInt(descriptor));
	fixture.registers.write(1, BigInt(command));
	fixture.registers.write(2, BigInt(argument));
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name: "fcntl" }, fixture);
}
