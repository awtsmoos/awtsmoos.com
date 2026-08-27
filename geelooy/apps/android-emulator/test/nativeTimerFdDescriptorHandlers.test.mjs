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
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeTimerFdSpec } from "../core/native/nativeTimerFdSpec.js";
import { createNativeTimerFdState } from "../core/native/nativeTimerFdState.js";
import { registerNativeTimerFdHandlers } from "../core/native/registerNativeTimerFdHandlers.js";

const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x5000n;

test("read consumes uint64 expiration count and returns eight bytes", () => {
	const fixture = createFixture();
	fixture.arm(5n, 10n);
	fixture.setNow(1020n);
	fixture.registers.write(0, BigInt(fixture.descriptor));
	fixture.registers.write(1, 0x5100n);
	fixture.registers.write(2, 8n);
	assert.equal(invoke(fixture, "read").result.result, 8);
	assert.equal(readAarch64Integer(fixture.memory, 0x5100n, 64), 3n);
});

test("nonready read returns EAGAIN and short read returns EINVAL", () => {
	const fixture = createFixture();
	fixture.arm(0n, 100n);
	fixture.registers.write(0, BigInt(fixture.descriptor));
	fixture.registers.write(1, 0x5100n);
	fixture.registers.write(2, 8n);
	assert.equal(invoke(fixture, "read").result.errno, 11);
	fixture.registers.write(0, BigInt(fixture.descriptor));
	fixture.registers.write(1, 0x5100n);
	fixture.registers.write(2, 4n);
	assert.equal(invoke(fixture, "read").result.errno, 22);
});

test("close retires timer and later read returns EBADF", () => {
	const fixture = createFixture();
	fixture.registers.write(0, BigInt(fixture.descriptor));
	assert.equal(invoke(fixture, "close").result.result, 0);
	fixture.registers.write(0, BigInt(fixture.descriptor));
	fixture.registers.write(1, 0x5100n);
	fixture.registers.write(2, 8n);
	assert.equal(invoke(fixture, "read").result.errno, 9);
});

function createFixture() {
	let now = 1000n;
	const clock = {
		now() { return now; },
		supports(clockId) { return clockId === CLOCK_MONOTONIC; }
	};
	const memory = createNativeAnonymousMemory(0x5000n, 0x1000, "timerfd-read");
	const errnoState = createNativeErrnoState(createNativeHeap(0x7000n, 0x1000));
	const state = createNativeTimerFdState({ clock });
	const descriptor = state.create(CLOCK_MONOTONIC, 0).descriptor;
	const registry = createNativeHostImportRegistry();
	registerNativeTimerFdHandlers(registry, { clock, errnoState, state });
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	return {
		arm(interval, value) {
			state.settime(descriptor, 0, createNativeTimerFdSpec(interval, value));
		},
		descriptor,
		memory,
		registers,
		registry,
		setNow(value) { now = BigInt(value); },
		systemRegisters
	};
}

function invoke(fixture, name) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}
