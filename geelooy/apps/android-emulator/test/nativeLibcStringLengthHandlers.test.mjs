//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcStringLengthHandlers } from "../core/native/nativeLibcStringLengthHandlers.js";

/**
 * Proves strlen counts exact guest bytes and resumes through X30.
 * The Awtsmoos recreates empty, ASCII, multibyte, and failure boundaries anew;
 * Awtsmoos.com measures no JavaScript character or host-native string.
 */
test("strlen returns zero for an empty guest C string", () => {
	const fixture = createFixture();
	writeCString(fixture.memory, "");
	const handled = invoke(fixture);
	assert.equal(handled.result.byteLength, 0);
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.registers.pc, 0x7777n);
});

test("strlen returns byte length for ASCII and multibyte UTF-8", () => {
	for (const value of ["/system", "שלום", "é"]) {
		const fixture = createFixture();
		writeCString(fixture.memory, value);
		invoke(fixture);
		const expected = new TextEncoder().encode(value).length;
		assert.equal(fixture.registers.read(0), BigInt(expected));
	}
});

test("strlen failures preserve X0 and program counter", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 0n);
	assert.throws(() => invoke(fixture), /NATIVE_C_STRING_NULL/);
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.registers.pc, 0x9000n);
	const bounded = createFixture(4);
	bounded.memory.write(0x5000n, Uint8Array.from([1, 2, 3, 4]));
	assert.throws(() => invoke(bounded), /NATIVE_ANONYMOUS_ADDRESS/);
	assert.equal(bounded.registers.read(0), 0x5000n);
	assert.equal(bounded.registers.pc, 0x9000n);
});

test("Flutter import registry exposes the measured strlen capability", () => {
	const heap = createNativeHeap(0x6000n, 0x200);
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" }),
		nativeHeap: heap
	}));
	assert.ok(registry.snapshot().includes("strlen"));
});

function createFixture(size = 0x100) {
	const memory = createNativeAnonymousMemory(0x5000n, size, "strlen-test");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(0, 0x5000n);
	registers.write(30, 0x7777n);
	const registry = createNativeHostImportRegistry();
	registerNativeLibcStringLengthHandlers(registry);
	return Object.freeze({ memory, registers, registry });
}

function invoke(fixture) {
	return fixture.registry.handle(
		Object.freeze({ name: "strlen" }),
		Object.freeze({ memory: fixture.memory, registers: fixture.registers })
	);
}

function writeCString(memory, value) {
	const bytes = new TextEncoder().encode(`${value}\0`);
	memory.write(0x5000n, bytes);
}
