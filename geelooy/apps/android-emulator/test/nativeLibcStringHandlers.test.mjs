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
 * Proves strcmp consumes X0/X1, returns signed W0, and resumes through X30.
 * The Awtsmoos recreates guest pointers, byte verdict, and control road anew;
 * Awtsmoos.com leaves registers untouched whenever memory truth cannot be read.
 */
test("strcmp writes exact signed W0 result and returns through X30", () => {
	const fixture = createFixture();
	write(fixture.memory, 0x5000n, [97, 0]);
	write(fixture.memory, 0x5010n, [99, 0]);
	fixture.registers.write(0, 0x5000n);
	fixture.registers.write(1, 0x5010n);
	const handled = invoke(fixture);
	assert.equal(handled.result.operation, "strcmp");
	assert.equal(handled.result.result, -2);
	assert.equal(handled.result.comparedBytes, 1);
	assert.equal(fixture.registers.read(0, 32), 0xfffffffen);
	assert.equal(fixture.registers.pc, 0x7777n);
});

test("comparison failures preserve X0 and program counter", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 0x5000n);
	fixture.registers.write(1, 0n);
	assert.throws(
		function invokeNullString() {
			invoke(fixture);
		},
		/NATIVE_C_STRING_NULL/
	);
	assert.equal(fixture.registers.read(0), 0x5000n);
	assert.equal(fixture.registers.pc, 0x9000n);
});

test("Flutter import registry exposes the measured strcmp capability", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	assert.ok(registry.snapshot().includes("strcmp"));
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x5000n, 0x100, "strcmp-handler");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, 0x7777n);
	const registry = createNativeHostImportRegistry();
	registerNativeLibcStringHandlers(registry);
	return Object.freeze({ memory, registers, registry });
}

function invoke(fixture) {
	return fixture.registry.handle(
		Object.freeze({ name: "strcmp" }),
		Object.freeze({ memory: fixture.memory, registers: fixture.registers })
	);
}

function write(memory, address, bytes) {
	memory.write(address, Uint8Array.from(bytes));
}
