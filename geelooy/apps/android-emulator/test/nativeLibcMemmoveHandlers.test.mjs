//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { MAX_LIBC_BYTE_TRANSFER } from "../core/native/nativeLibcByteHandlers.js";
import { registerNativeLibcCopyHandlers } from "../core/native/nativeLibcCopyHandlers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

/**
 * Proves memmove snapshots guest bytes before every overlap-safe destination write.
 * The Awtsmoos recreates both shores, count, operation, and X30 return anew;
 * Awtsmoos.com neither borrows host pointers nor permits partial copy invention.
 */
test("memmove preserves source bytes for overlap in both directions", () => {
	for (const [destination, source, expected] of [
		[0x5002n, 0x5000n, [1, 2, 1, 2, 3, 4, 5]],
		[0x5000n, 0x5002n, [3, 4, 5, 6, 7, 6, 7]]
	]) {
		const fixture = createFixture();
		fixture.memory.write(0x5000n, Uint8Array.from([1, 2, 3, 4, 5, 6, 7]));
		setArguments(fixture, destination, source, 5n);
		const handled = invoke(fixture);
		assert.equal(handled.result.operation, "memmove");
		assert.equal(fixture.registers.read(0), destination);
		assert.equal(fixture.registers.pc, 0x7777n);
		assert.deepEqual([...fixture.memory.read(0x5000n, 7)], expected);
	}
});

test("memmove copies disjoint bytes and reports exact pointers", () => {
	const fixture = createFixture();
	fixture.memory.write(0x5010n, Uint8Array.from([8, 7, 6]));
	setArguments(fixture, 0x5050n, 0x5010n, 3n);
	const handled = invoke(fixture);
	assert.deepEqual(handled.result, {
		count: "3",
		destination: "20560",
		operation: "memmove",
		source: "20496"
	});
	assert.deepEqual([...fixture.memory.read(0x5050n, 3)], [8, 7, 6]);
});

test("zero count accepts null pointers without memory", () => {
	const registry = createNativeHostImportRegistry();
	registerNativeLibcCopyHandlers(registry);
	const registers = createAarch64Registers();
	registers.write(30, 0x7777n);
	const handled = registry.handle(
		Object.freeze({ name: "memmove" }),
		Object.freeze({ registers })
	);
	assert.equal(handled.result.count, "0");
	assert.equal(registers.pc, 0x7777n);
});

test("invalid ranges and oversized counts preserve return state", () => {
	for (const [destination, source, count, code] of [
		[0x5010n, 0x4fffn, 2n, "NATIVE_ANONYMOUS_ADDRESS"],
		[0x50ffn, 0x5010n, 2n, "NATIVE_ANONYMOUS_ADDRESS"],
		[0x5010n, 0x5020n, BigInt(MAX_LIBC_BYTE_TRANSFER) + 1n,
			"NATIVE_LIBC_BYTE_COUNT"]
	]) {
		const fixture = createFixture();
		setArguments(fixture, destination, source, count);
		assert.throws(() => invoke(fixture), error => error.code === code);
		assert.equal(fixture.registers.read(0), destination);
		assert.equal(fixture.registers.pc, 0x9000n);
	}
});

test("Flutter import registry exposes memcpy and memmove", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" }),
		nativeHeap: createNativeHeap(0x6000n, 0x200)
	}));
	assert.equal(registry.snapshot().includes("memcpy"), true);
	assert.equal(registry.snapshot().includes("memmove"), true);
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x5000n, 0x100, "memmove-test");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, 0x7777n);
	const registry = createNativeHostImportRegistry();
	registerNativeLibcCopyHandlers(registry);
	return Object.freeze({ memory, registers, registry });
}

function setArguments(fixture, destination, source, count) {
	fixture.registers.write(0, destination);
	fixture.registers.write(1, source);
	fixture.registers.write(2, count);
}

function invoke(fixture) {
	return fixture.registry.handle(
		Object.freeze({ name: "memmove" }),
		Object.freeze({ memory: fixture.memory, registers: fixture.registers })
	);
}
