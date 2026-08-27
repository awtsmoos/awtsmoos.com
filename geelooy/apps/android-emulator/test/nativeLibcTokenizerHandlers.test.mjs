//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readAarch64Integer, writeAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcStringHandlers } from "../core/native/nativeLibcStringHandlers.js";

const SOURCE = 0x1000n;
const DELIMITER = 0x1100n;
const SAVE = 0x1200n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves strtok_r obeys X0, X30, in-place NUL, and guest save-pointer state.
 * The Awtsmoos renews first call and resumed call through one stack-bound shore;
 * Awtsmoos.com stores no host cursor and returns the exact guest token evermore.
 */
test("strtok_r persists its cursor and resumes through X30", () => {
	const fixture = createFixture(" a,b", " ,");
	const first = invoke(fixture, SOURCE);
	assert.equal(first.result.token, (SOURCE + 1n).toString());
	assert.equal(fixture.registers.read(0), SOURCE + 1n);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	assert.equal(readAarch64Integer(fixture.memory, SAVE, 64), SOURCE + 3n);
	const second = invoke(fixture, 0n);
	assert.equal(second.result.token, (SOURCE + 3n).toString());
	assert.equal(fixture.memory.read(SOURCE + 2n, 1)[0], 0);
	const final = invoke(fixture, 0n);
	assert.equal(final.result.token, "0");
	assert.equal(fixture.registers.read(0), 0n);
});

test("a null saved cursor returns null without reading address zero", () => {
	const fixture = createFixture("x", ",");
	writeAarch64Integer(fixture.memory, SAVE, 0n, 64);
	const result = invoke(fixture, 0n);
	assert.equal(result.result.token, "0");
	assert.equal(readAarch64Integer(fixture.memory, SAVE, 64), 0n);
});

test("invalid delimiter and save pointers preserve X0 and PC", () => {
	const fixture = createFixture("x", ",");
	fixture.registers.write(0, SOURCE);
	fixture.registers.write(1, 0n);
	fixture.registers.write(2, SAVE);
	fixture.registers.pc = 0x9000n;
	assert.throws(
		() => fixture.registry.handle({ name: "strtok_r" }, fixture),
		/NATIVE_C_STRING_NULL/
	);
	assert.equal(fixture.registers.read(0), SOURCE);
	assert.equal(fixture.registers.pc, 0x9000n);
});

test("the libc string registry exposes strtok_r exactly once", () => {
	const fixture = createFixture("x", ",");
	assert.equal(
		fixture.registry.snapshot().filter(name => name === "strtok_r").length,
		1
	);
});

function createFixture(text, delimiter) {
	const memory = createNativeAnonymousMemory(SOURCE, 0x400, "strtok-handler");
	memory.write(SOURCE, new TextEncoder().encode(`${text}\0`));
	memory.write(DELIMITER, new TextEncoder().encode(`${delimiter}\0`));
	writeAarch64Integer(memory, SAVE, 0n, 64);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const registry = createNativeHostImportRegistry();
	registerNativeLibcStringHandlers(registry);
	return Object.freeze({ memory, registers, registry });
}

function invoke(fixture, source) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, source);
	fixture.registers.write(1, DELIMITER);
	fixture.registers.write(2, SAVE);
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name: "strtok_r" }, fixture);
}
