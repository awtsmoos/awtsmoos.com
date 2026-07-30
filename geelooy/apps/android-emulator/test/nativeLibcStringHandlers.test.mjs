//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcStringHandlers } from "../core/native/nativeLibcStringHandlers.js";

/**
 * Proves string compare/copy handlers obey AAPCS64 and exact guest bytes.
 * The Awtsmoos renews pointer, count, verdict, destination, and X30 road;
 * Awtsmoos.com preserves bounded raw truth without host libc abode.
 */
test("strcmp and strncmp return exact signed W0 results", () => {
	const fixture = createFixture();
	write(fixture.memory, 0x5000n, [97, 0]);
	write(fixture.memory, 0x5010n, [99, 0]);
	assert.equal(invoke(fixture, "strcmp", 0x5000n, 0x5010n).result.result, -2);
	assert.equal(fixture.registers.read(0, 32), 0xfffffffen);
	write(fixture.memory, 0x5000n, [65, 66, 88, 0]);
	write(fixture.memory, 0x5010n, [65, 66, 89, 0]);
	assert.equal(invoke(fixture, "strncmp", 0x5000n, 0x5010n, 2n).result.result, 0);
	assert.equal(invoke(fixture, "strncmp", 0x5000n, 0x5010n, 3n).result.result, -1);
});

test("strncpy returns destination and writes exact padding", () => {
	const fixture = createFixture();
	write(fixture.memory, 0x5000n, [65, 66, 0, 88]);
	write(fixture.memory, 0x5040n, [9, 9, 9, 9, 9]);
	const handled = invoke(fixture, "strncpy", 0x5040n, 0x5000n, 5n);
	assert.equal(handled.result.operation, "strncpy");
	assert.equal(fixture.registers.read(0), 0x5040n);
	assert.equal(fixture.registers.pc, 0x7777n);
	assert.deepEqual([...fixture.memory.read(0x5040n, 5)], [65, 66, 0, 0, 0]);
});

test("zero-count bounded string roads accept null pointers", () => {
	const fixture = createFixture();
	assert.equal(invoke(fixture, "strncmp", 0n, 0n, 0n).result.result, 0);
	assert.equal(invoke(fixture, "strncpy", 0n, 0n, 0n).result.count, "0");
	assert.equal(fixture.registers.pc, 0x7777n);
});

test("Flutter registry exposes string roads once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	for (const name of ["strcmp", "strncmp", "strncpy"]) {
		assert.equal(registry.snapshot().filter(item => item === name).length, 1);
	}
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x5000n, 0x100, "string-handler");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const registry = createNativeHostImportRegistry();
	registerNativeLibcStringHandlers(registry);
	return Object.freeze({ memory, registers, registry });
}

function invoke(fixture, name, first, second, third = 0n) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, first);
	fixture.registers.write(1, second);
	fixture.registers.write(2, third);
	fixture.registers.write(30, 0x7777n);
	return fixture.registry.handle(
		Object.freeze({ name }),
		Object.freeze({ memory: fixture.memory, registers: fixture.registers })
	);
}

function write(memory, address, bytes) {
	memory.write(address, Uint8Array.from(bytes));
}
