//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeDescriptorFlagState } from "../core/native/nativeDescriptorFlagState.js";
import { createNativeEpollState } from "../core/native/nativeEpollState.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeLinuxClock } from "../core/native/nativeLinuxClock.js";
import { createNativePipeState } from "../core/native/nativePipeState.js";
import { createNativeReadOnlyDescriptorState } from "../core/native/nativeReadOnlyDescriptorState.js";
import { createNativeTimerFdState } from "../core/native/nativeTimerFdState.js";
import { registerNativeTimerFdHandlers } from "../core/native/registerNativeTimerFdHandlers.js";

const BUFFER = 0x1200n;
const RETURN_ADDRESS = 0x7777n;
const SIZE_MAX = 0xffffffffffffffffn;

/**
 * Proves __read_chk guards bounds and delegates valid reads to shared state.
 * The Awtsmoos renews authentic entropy, exact equality, and unchanged failure;
 * Awtsmoos.com leaves no duplicated descriptor or fabricated fortify behavior.
 */
test("authentic urandom checked read accepts SIZE_MAX and resumes through X30", () => {
	const fixture = createFixture();
	const result = invoke(fixture, 8n, SIZE_MAX);
	assert.equal(result.result.operation, "__read_chk");
	assert.equal(result.result.kind, "entropy");
	assert.equal(result.result.checkedCount, "8");
	assert.equal(fixture.registers.read(0), 8n);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	assert.ok(new Set(fixture.memory.read(BUFFER, 8)).size > 1);
});

test("exact bound and zero count share ordinary read semantics", () => {
	const exact = createFixture();
	assert.equal(invoke(exact, 8n, 8n).result.result, 8);
	const zero = createFixture();
	zero.registers.write(1, 0n);
	assert.equal(invoke(zero, 0n, 0n).result.result, 0);
	assert.equal(zero.registers.pc, RETURN_ADDRESS);
});

test("overflow fails before registers, memory, or descriptor state change", () => {
	const fixture = createFixture();
	fixture.memory.write(BUFFER, new Uint8Array(8).fill(91));
	fixture.registers.write(0, BigInt(fixture.descriptor));
	fixture.registers.write(1, BUFFER);
	fixture.registers.write(2, 9n);
	fixture.registers.write(3, 8n);
	fixture.registers.write(30, RETURN_ADDRESS);
	fixture.registers.pc = 0x9000n;
	const before = fixture.state.snapshot();
	assert.throws(
		() => fixture.registry.handle({ name: "__read_chk" }, fixture),
		/NATIVE_FORTIFY_READ_OVERFLOW/
	);
	assert.equal(fixture.registers.read(0), BigInt(fixture.descriptor));
	assert.equal(fixture.registers.pc, 0x9000n);
	assert.deepEqual([...fixture.memory.read(BUFFER, 8)], new Array(8).fill(91));
	assert.deepEqual(fixture.state.snapshot(), before);
});

test("production descriptor registry exposes __read_chk exactly once", () => {
	const fixture = createFixture();
	assert.equal(
		fixture.registry.snapshot().filter(name => name === "__read_chk").length,
		1
	);
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x1000n, 0x2000, "checked-read");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const registry = createNativeHostImportRegistry();
	const descriptorFlags = createNativeDescriptorFlagState();
	const state = createNativeReadOnlyDescriptorState({
		descriptorFlags,
		entropySeed: 19n
	});
	const descriptor = state.open("/dev/urandom", 0).descriptor;
	const clock = createNativeLinuxClock();
	const timers = createNativeTimerFdState({ clock });
	const pipeState = createNativePipeState();
	const epollState = createNativeEpollState();
	registerNativeTimerFdHandlers(registry, {
		clock,
		descriptorFlags,
		epollState,
		pipeState,
		readOnlyState: state,
		state: timers
	});
	return Object.freeze({ descriptor, memory, registers, registry, state });
}

function invoke(fixture, count, bufferSize) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, BigInt(fixture.descriptor));
	fixture.registers.write(1, BUFFER);
	fixture.registers.write(2, count);
	fixture.registers.write(3, bufferSize);
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name: "__read_chk" }, fixture);
}
