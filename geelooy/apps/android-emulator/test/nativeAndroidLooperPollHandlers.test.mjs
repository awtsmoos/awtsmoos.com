//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAndroidLooperCallbackState } from "../core/native/nativeAndroidLooperCallbackState.js";
import { createNativeAndroidLooperState } from "../core/native/nativeAndroidLooperState.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import { registerNativeAndroidLooperHandlers } from "../core/native/registerNativeAndroidLooperHandlers.js";

const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x5000n;

test("addFd and pollOnce write direct-event outputs and return ident", () => {
	const fixture = createFixture();
	const handle = fixture.state.prepare(THREAD);
	setAddArguments(fixture.registers, handle);
	assert.equal(invoke(fixture, "ALooper_addFd").result.result, 1);
	assert.equal(fixture.state.enqueue(handle, 7, 5), true);
	fixture.registers.write(0, 0n);
	fixture.registers.write(1, 0x5100n);
	fixture.registers.write(2, 0x5104n);
	fixture.registers.write(3, 0x5108n);
	assert.equal(invoke(fixture, "ALooper_pollOnce").result.result, 42);
	assert.equal(readAarch64Integer(fixture.memory, 0x5100n, 32), 7n);
	assert.equal(readAarch64Integer(fixture.memory, 0x5104n, 32), 5n);
	assert.equal(readAarch64Integer(fixture.memory, 0x5108n, 64), 0xabcden);
});

test("addFd replaces registrations and removeFd reports exact membership", () => {
	const fixture = createFixture();
	const handle = fixture.state.prepare(THREAD);
	setAddArguments(fixture.registers, handle);
	assert.equal(invoke(fixture, "ALooper_addFd").result.result, 1);
	setAddArguments(fixture.registers, handle);
	fixture.registers.write(2, 43n);
	assert.equal(invoke(fixture, "ALooper_addFd").result.result, 1);
	fixture.registers.write(0, handle);
	fixture.registers.write(1, 7n);
	assert.equal(invoke(fixture, "ALooper_removeFd").result.result, 1);
	fixture.registers.write(0, handle);
	fixture.registers.write(1, 7n);
	assert.equal(invoke(fixture, "ALooper_removeFd").result.result, 0);
});

test("invalid descriptor arguments return minus one without mutation", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 0x99n);
	fixture.registers.write(1, 7n);
	fixture.registers.write(2, 42n);
	fixture.registers.write(3, 1n);
	fixture.registers.write(4, 0n);
	fixture.registers.write(5, 0n);
	assert.equal(invoke(fixture, "ALooper_addFd").result.result, -1);
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x5000n, 0x1000, "alooper-poll");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	const state = createNativeAndroidLooperState();
	const registry = createNativeHostImportRegistry();
	registerNativeAndroidLooperHandlers(registry, {
		callbacks: createNativeAndroidLooperCallbackState(),
		imports: createNativeImportAddressSpace({ base: 0x7000n }),
		state
	});
	return { memory, registers, registry, state, systemRegisters };
}

function invoke(fixture, name) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}

function setAddArguments(registers, handle) {
	registers.write(0, handle);
	registers.write(1, 7n);
	registers.write(2, 42n);
	registers.write(3, 1n);
	registers.write(4, 0n);
	registers.write(5, 0xabcden);
}
