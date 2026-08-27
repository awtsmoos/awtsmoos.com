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
 * Proves memcpy snapshots bounded guest bytes and resumes through X30.
 * The Awtsmoos recreates source, destination, overlap, and neighboring shore
 * anew; Awtsmoos.com exposes no host pointer and fabricates no successful copy.
 */
test("memcpy copies exact bytes and preserves neighboring destination bytes", () => {
	const fixture = createFixture();
	fixture.memory.write(0x5010n, Uint8Array.from([1, 2, 3, 4, 5]));
	fixture.memory.write(0x5050n, new Uint8Array(9).fill(0x7a));
	setArguments(fixture, 0x5052n, 0x5010n, 5n);
	const handled = invoke(fixture);
	assert.equal(handled.result.operation, "memcpy");
	assert.equal(fixture.registers.read(0), 0x5052n);
	assert.equal(fixture.registers.pc, 0x7777n);
	assert.deepEqual([...fixture.memory.read(0x5050n, 9)], [
		0x7a, 0x7a, 1, 2, 3, 4, 5, 0x7a, 0x7a
	]);
});

test("zero count accepts null pointers without memory access", () => {
	const registry = createNativeHostImportRegistry();
	registerNativeLibcCopyHandlers(registry);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, 0x7777n);
	const handled = registry.handle(
		Object.freeze({ name: "memcpy" }),
		Object.freeze({ registers })
	);
	assert.equal(handled.result.count, "0");
	assert.equal(registers.read(0), 0n);
	assert.equal(registers.pc, 0x7777n);
});

test("overlapping ranges copy from a detached source snapshot", () => {
	const fixture = createFixture();
	fixture.memory.write(0x5000n, Uint8Array.from([1, 2, 3, 4, 5, 6, 7]));
	setArguments(fixture, 0x5002n, 0x5000n, 5n);
	invoke(fixture);
	assert.deepEqual([...fixture.memory.read(0x5000n, 7)], [1, 2, 1, 2, 3, 4, 5]);
});

test("invalid ranges and oversized counts preserve registers and bytes", () => {
	for (const [destination, source, count, code] of [
		[0x5010n, 0x4fffn, 2n, "NATIVE_ANONYMOUS_ADDRESS"],
		[0x50ffn, 0x5010n, 2n, "NATIVE_ANONYMOUS_ADDRESS"],
		[0x5010n, 0x5020n, BigInt(MAX_LIBC_BYTE_TRANSFER) + 1n, "NATIVE_LIBC_BYTE_COUNT"]
	]) {
		const fixture = createFixture();
		fixture.memory.write(0x5010n, Uint8Array.from([9, 8, 7, 6]));
		setArguments(fixture, destination, source, count);
		assert.throws(() => invoke(fixture), error => error.code === code);
		assert.equal(fixture.registers.read(0), destination);
		assert.equal(fixture.registers.pc, 0x9000n);
		assert.deepEqual([...fixture.memory.read(0x5010n, 4)], [9, 8, 7, 6]);
	}
});

test("Flutter import registry exposes the measured memcpy capability", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" }),
		nativeHeap: createNativeHeap(0x6000n, 0x200)
	}));
	assert.ok(registry.snapshot().includes("memcpy"));
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x5000n, 0x100, "memcpy-test");
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
		Object.freeze({ name: "memcpy" }),
		Object.freeze({ memory: fixture.memory, registers: fixture.registers })
	);
}
