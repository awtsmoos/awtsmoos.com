//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { registerNativeLibcMemoryHandlers } from "../core/native/nativeLibcMemoryHandlers.js";
import { registerNativeMemoryMapHandlers } from "../core/native/nativeMemoryMapHandlers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import {
	NATIVE_MAP_FAILED,
	NATIVE_VIRTUAL_MEMORY_START
} from "../core/native/nativeVirtualMemoryConstants.js";
import { createNativeVirtualMemory } from "../core/native/nativeVirtualMemory.js";

const THREAD = 0x1234n;
const RETURN = 0x7777n;

/**
 * Proves mmap-family AAPCS64 results, signed fd evidence, X30, and shared errno.
 * The Awtsmoos renews six arguments, guest pointer, failure cell, and return way;
 * Awtsmoos.com leaves host mappings outside the emulated libc display.
 */
test("authentic mmap returns a 64-bit sparse reservation and resumes through X30", () => {
	const fixture = createFixture();
	const handled = invoke(fixture, "mmap", [0n, 8589930496n, 0n, 0x4022n, 0xffffffffn, 0n]);
	assert.equal(handled.result.success, true);
	assert.equal(handled.result.fd, -1);
	assert.equal(fixture.registers.read(0), NATIVE_VIRTUAL_MEMORY_START);
	assert.equal(fixture.registers.pc, RETURN);
	assert.equal(fixture.memory.snapshot().pages.residentPageCount, 0);
});

test("mprotect and munmap mutate the same persistent guest mapping", () => {
	const fixture = createFixture();
	invoke(fixture, "mmap", [0n, 4096n, 0n, 0x22n, 0xffffffffn, 0n]);
	const address = fixture.registers.read(0);
	assert.equal(invoke(fixture, "mprotect", [address, 4096n, 3n]).result.success, true);
	fixture.memory.write(address, Uint8Array.of(5));
	assert.equal(fixture.memory.read(address, 1)[0], 5);
	assert.equal(invoke(fixture, "munmap", [address, 4096n]).result.success, true);
	assert.equal(fixture.memory.contains(address, 1), false);
});

test("invalid mmap returns MAP_FAILED and sets the shared thread errno", () => {
	const fixture = createFixture();
	const handled = invoke(fixture, "mmap", [0n, 0n, 0n, 0x22n, 0xffffffffn, 0n]);
	assert.equal(handled.result.success, false);
	assert.equal(fixture.registers.read(0), NATIVE_MAP_FAILED);
	assert.equal(fixture.errno.get(THREAD), 22);
	assert.equal(fixture.registers.pc, RETURN);
});

test("libc memory registry exposes every mapping import exactly once", () => {
	const registry = createNativeHostImportRegistry();
	const memory = createNativeVirtualMemory();
	registerNativeLibcMemoryHandlers(registry, {
		nativeHeap: createNativeHeap(0x500000n, 0x10000),
		nativeVirtualMemory: memory
	}, createErrno());
	for (const name of ["mmap", "mmap64", "mprotect", "munmap"]) {
		assert.equal(registry.snapshot().filter(candidate => candidate === name).length, 1);
	}
});

function createFixture() {
	const memory = createNativeVirtualMemory();
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	const registry = createNativeHostImportRegistry();
	const errno = createErrno();
	registerNativeMemoryMapHandlers(registry, { errnoState: errno, virtualMemory: memory });
	return Object.freeze({ errno, memory, registers, registry, systemRegisters });
}

function invoke(fixture, name, argumentsList) {
	fixture.registers.pc = 0x9000n;
	argumentsList.forEach((value, index) => fixture.registers.write(index, value));
	fixture.registers.write(30, RETURN);
	return fixture.registry.handle({ name }, fixture);
}

function createErrno() {
	const values = new Map();
	return Object.freeze({
		get(thread) {
			return values.get(BigInt(thread).toString()) || 0;
		},
		set(thread, value) {
			values.set(BigInt(thread).toString(), Number(value));
		}
	});
}
