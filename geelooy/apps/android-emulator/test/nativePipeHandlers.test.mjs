//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeErrnoState } from "../core/native/nativeErrnoState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativePipeState } from "../core/native/nativePipeState.js";
import { createNativeTimerFdState } from "../core/native/nativeTimerFdState.js";
import { registerNativeTimerFdHandlers } from "../core/native/registerNativeTimerFdHandlers.js";

const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x5000n;

test("legacy pipe writes descriptors with zero flags", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 0x5100n);
	fixture.registers.write(1, 0xffffffffn);
	const handled = invoke(fixture, "pipe");
	assert.equal(handled.result.result, 0);
	assert.equal(handled.result.flags, 0);
	assert.equal(readAarch64Integer(fixture.memory, 0x5100n, 32), 0x40010000n);
	assert.equal(readAarch64Integer(fixture.memory, 0x5104n, 32), 0x40010001n);
});

test("authentic pipe2 writes two descriptors and preserves ABI", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 0x5100n);
	fixture.registers.write(1, 526336n);
	fixture.registers.write(5, 0xabcden);
	const handled = invoke(fixture, "pipe2");
	assert.equal(handled.result.result, 0);
	assert.equal(readAarch64Integer(fixture.memory, 0x5100n, 32), 0x40010000n);
	assert.equal(readAarch64Integer(fixture.memory, 0x5104n, 32), 0x40010001n);
	assert.equal(fixture.registers.read(5), 0xabcden);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("write and read move guest bytes through one FIFO", () => {
	const fixture = createFixture();
	const pair = fixture.pipes.create(0);
	fixture.memory.write(0x5200n, Uint8Array.of(9, 8, 7));
	fixture.registers.write(0, BigInt(pair.writeFd));
	fixture.registers.write(1, 0x5200n);
	fixture.registers.write(2, 3n);
	assert.equal(invoke(fixture, "write").result.result, 3);
	fixture.registers.write(0, BigInt(pair.readFd));
	fixture.registers.write(1, 0x5300n);
	fixture.registers.write(2, 3n);
	assert.equal(invoke(fixture, "read").result.result, 3);
	assert.deepEqual([...fixture.memory.read(0x5300n, 3)], [9, 8, 7]);
});

test("empty read, EOF, EPIPE, and EBADF expose POSIX results", () => {
	const fixture = createFixture();
	const pair = fixture.pipes.create(0);
	setRead(fixture, pair.readFd);
	assert.equal(invoke(fixture, "read").result.errno, 11);
	fixture.pipes.close(pair.writeFd);
	setRead(fixture, pair.readFd);
	assert.equal(invoke(fixture, "read").result.result, 0);
	const second = fixture.pipes.create(0);
	fixture.pipes.close(second.readFd);
	fixture.memory.write(0x5200n, Uint8Array.of(1));
	fixture.registers.write(0, BigInt(second.writeFd));
	fixture.registers.write(1, 0x5200n);
	fixture.registers.write(2, 1n);
	assert.equal(invoke(fixture, "write").result.errno, 32);
	fixture.registers.write(0, 99n);
	assert.equal(invoke(fixture, "close").result.errno, 9);
});

test("registry exposes pipe aliases and descriptor roads once", () => {
	const names = createFixture().registry.snapshot();
	for (const name of ["pipe", "pipe2", "read", "write", "close"]) {
		assert.equal(names.filter(item => item === name).length, 1);
	}
});

function createFixture() {
	const clock = { now() { return 0n; }, supports() { return true; } };
	const memory = createNativeAnonymousMemory(0x5000n, 0x1000, "pipe");
	const errnoState = createNativeErrnoState(createNativeHeap(0x7000n, 0x1000));
	const pipes = createNativePipeState();
	const state = createNativeTimerFdState({ clock });
	const registry = createNativeHostImportRegistry();
	registerNativeTimerFdHandlers(registry, { clock, errnoState, pipeState: pipes, state });
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	return { memory, pipes, registers, registry, systemRegisters };
}

function invoke(fixture, name) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}

function setRead(fixture, descriptor) {
	fixture.registers.write(0, BigInt(descriptor));
	fixture.registers.write(1, 0x5300n);
	fixture.registers.write(2, 8n);
}
