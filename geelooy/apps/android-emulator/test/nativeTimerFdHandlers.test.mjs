//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { CLOCK_MONOTONIC } from "../core/native/nativeLinuxClock.js";
import { createNativeErrnoState } from "../core/native/nativeErrnoState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { writeNativeTimerFdSpec } from "../core/native/nativeTimerFdSpec.js";
import { createNativeTimerFdState } from "../core/native/nativeTimerFdState.js";
import { registerNativeTimerFdHandlers } from "../core/native/registerNativeTimerFdHandlers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x5000n;

test("authentic timerfd_create returns a bounded descriptor", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 1n);
	fixture.registers.write(1, 526336n);
	const handled = invoke(fixture, "timerfd_create");
	assert.equal(handled.result.result, 0x40000000);
	assert.equal(fixture.registers.read(0, 32), 0x40000000n);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("timerfd_settime reads new spec and writes old spec", () => {
	const fixture = createFixture();
	const descriptor = fixture.state.create(CLOCK_MONOTONIC, 0).descriptor;
	writeNativeTimerFdSpec(fixture.memory, 0x5100n, {
		intervalNanoseconds: 5n,
		valueNanoseconds: 100n
	});
	fixture.registers.write(0, BigInt(descriptor));
	fixture.registers.write(1, 0n);
	fixture.registers.write(2, 0x5100n);
	fixture.registers.write(3, 0x5140n);
	assert.equal(invoke(fixture, "timerfd_settime").result.result, 0);
	assert.equal(readAarch64Integer(fixture.memory, 0x5140n, 64), 0n);
	assert.equal(readAarch64Integer(fixture.memory, 0x5150n, 64), 0n);
});

test("clock_gettime writes seconds and nanoseconds", () => {
	const fixture = createFixture(2000000005n);
	fixture.registers.write(0, 1n);
	fixture.registers.write(1, 0x5180n);
	assert.equal(invoke(fixture, "clock_gettime").result.result, 0);
	assert.equal(readAarch64Integer(fixture.memory, 0x5180n, 64), 2n);
	assert.equal(readAarch64Integer(fixture.memory, 0x5188n, 64), 5n);
});

test("invalid clock and malformed timer spec return EINVAL", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 99n);
	fixture.registers.write(1, 0n);
	assert.equal(invoke(fixture, "timerfd_create").result.errno, 22);
	fixture.memory.write(0x5100n, new Uint8Array(32).fill(0xff));
	fixture.registers.write(0, 0x40000000n);
	fixture.registers.write(1, 0n);
	fixture.registers.write(2, 0x5100n);
	fixture.registers.write(3, 0n);
	assert.equal(invoke(fixture, "timerfd_settime").result.errno, 22);
});

function createFixture(initialNow = 1000n) {
	let now = initialNow;
	const clock = {
		now(clockId) {
			return clockId === CLOCK_MONOTONIC ? now : null;
		},
		supports(clockId) {
			return clockId === CLOCK_MONOTONIC;
		}
	};
	const memory = createNativeAnonymousMemory(0x5000n, 0x1000, "timerfd");
	const heap = createNativeHeap(0x7000n, 0x1000);
	const errnoState = createNativeErrnoState(heap);
	const state = createNativeTimerFdState({ clock });
	const registry = createNativeHostImportRegistry();
	registerNativeTimerFdHandlers(registry, { clock, errnoState, state });
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	registers.write(30, RETURN_ADDRESS);
	return { clock, errnoState, memory, now, registers, registry, state, systemRegisters };
}

function invoke(fixture, name) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}
