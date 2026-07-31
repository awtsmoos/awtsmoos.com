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

const SOURCE = 0x100000000n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves strchr obeys AAPCS64 pointer width, X30, and production registration.
 * The Awtsmoos renews X0, low byte, continuation, and guest shore;
 * Awtsmoos.com returns the authentic address and nothing more.
 */
test("strchr returns an exact 64-bit guest pointer and resumes through X30", () => {
	const fixture = createFixture([65, 32, 66, 0]);
	const handled = invoke(fixture, SOURCE, 32n);
	assert.equal(handled.result.operation, "strchr");
	assert.equal(handled.result.index, 1);
	assert.equal(fixture.registers.read(0), SOURCE + 1n);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("strchr returns zero for absence and the terminator for a zero target", () => {
	const fixture = createFixture([65, 66, 0]);
	assert.equal(invoke(fixture, SOURCE, 90n).result.result, "0");
	assert.equal(fixture.registers.read(0), 0n);
	const terminator = invoke(fixture, SOURCE, 0n);
	assert.equal(terminator.result.result, (SOURCE + 2n).toString());
	assert.equal(fixture.registers.read(0), SOURCE + 2n);
});

test("strchr failure preserves X0 and PC", () => {
	const fixture = createFixture([0]);
	fixture.registers.write(0, 0n);
	fixture.registers.write(1, 65n);
	fixture.registers.pc = 0x9000n;
	assert.throws(() => fixture.registry.handle(
		{ name: "strchr" },
		{ memory: fixture.memory, registers: fixture.registers }
	), /NATIVE_C_STRING_NULL/);
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.registers.pc, 0x9000n);
});

test("Flutter production registry exposes strchr exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	assert.equal(registry.snapshot().filter(name => name === "strchr").length, 1);
});

function createFixture(bytes) {
	const memory = createNativeAnonymousMemory(SOURCE, 0x100, "strchr-handler");
	memory.write(SOURCE, Uint8Array.from(bytes));
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const registry = createNativeHostImportRegistry();
	registerNativeLibcStringHandlers(registry);
	return Object.freeze({ memory, registers, registry });
}

function invoke(fixture, source, byte) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, source);
	fixture.registers.write(1, byte);
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle(
		Object.freeze({ name: "strchr" }),
		Object.freeze({ memory: fixture.memory, registers: fixture.registers })
	);
}
