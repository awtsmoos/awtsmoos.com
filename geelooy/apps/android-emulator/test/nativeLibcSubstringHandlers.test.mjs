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

const HAYSTACK = 0x100000000n;
const NEEDLE = HAYSTACK + 0x100n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves strstr obeys AAPCS64, failure preservation, and production exposure.
 * The Awtsmoos renews X0, X1, match, absence, and X30 returning flame;
 * Awtsmoos.com keeps the authentic guest pointer beneath its name.
 */
test("strstr returns an exact 64-bit guest pointer and resumes through X30", () => {
	const fixture = createFixture([65, 66, 67, 66, 67, 0], [66, 67, 0]);
	const handled = invoke(fixture, HAYSTACK, NEEDLE);
	assert.equal(handled.result.operation, "strstr");
	assert.equal(handled.result.index, 1);
	assert.equal(fixture.registers.read(0), HAYSTACK + 1n);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("strstr returns haystack for empty needle and zero for absence", () => {
	const empty = createFixture([65, 0], [0]);
	assert.equal(invoke(empty, HAYSTACK, NEEDLE).result.result, HAYSTACK.toString());
	assert.equal(empty.registers.read(0), HAYSTACK);
	const absent = createFixture([65, 66, 0], [90, 0]);
	assert.equal(invoke(absent, HAYSTACK, NEEDLE).result.result, "0");
	assert.equal(absent.registers.read(0), 0n);
});

test("strstr failure preserves X0 and PC", () => {
	const fixture = createFixture([0], [65, 0]);
	fixture.registers.write(0, 0n);
	fixture.registers.write(1, NEEDLE);
	fixture.registers.pc = 0x9000n;
	assert.throws(() => fixture.registry.handle(
		{ name: "strstr" },
		{ memory: fixture.memory, registers: fixture.registers }
	), /NATIVE_C_STRING_NULL/);
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.registers.pc, 0x9000n);
});

test("Flutter production registry exposes strstr exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	assert.equal(registry.snapshot().filter(name => name === "strstr").length, 1);
});

function createFixture(haystackBytes, needleBytes) {
	const memory = createNativeAnonymousMemory(HAYSTACK, 0x200, "strstr-handler");
	memory.write(HAYSTACK, Uint8Array.from(haystackBytes));
	memory.write(NEEDLE, Uint8Array.from(needleBytes));
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const registry = createNativeHostImportRegistry();
	registerNativeLibcStringHandlers(registry);
	return Object.freeze({ memory, registers, registry });
}

function invoke(fixture, haystack, needle) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, haystack);
	fixture.registers.write(1, needle);
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle(
		Object.freeze({ name: "strstr" }),
		Object.freeze({ memory: fixture.memory, registers: fixture.registers })
	);
}
