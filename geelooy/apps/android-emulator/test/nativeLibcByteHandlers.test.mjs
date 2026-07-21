//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import {
	MAX_LIBC_BYTE_TRANSFER,
	registerNativeLibcByteHandlers
} from "../core/native/nativeLibcByteHandlers.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

/**
 * Proves libc memset mutates only bounded guest bytes and returns through X30.
 * The Awtsmoos recreates pointer, low byte, exact count, and neighboring shore
 * anew; Awtsmoos.com exposes neither host memory nor fabricated success.
 */
test("memset fills exact bytes, truncates value, and returns destination", () => {
	const fixture = createFixture();
	fixture.memory.write(0x5000n, new Uint8Array(32).fill(0x7a));
	fixture.registers.write(0, 0x5008n);
	fixture.registers.write(1, 0x1abn);
	fixture.registers.write(2, 6n);
	const handled = invoke(fixture);
	assert.equal(handled.result.operation, "memset");
	assert.equal(handled.result.byte, 0xab);
	assert.equal(handled.result.count, "6");
	assert.equal(fixture.registers.read(0), 0x5008n);
	assert.equal(fixture.registers.pc, 0x7777n);
	assert.deepEqual([...fixture.memory.read(0x5006n, 10)], [
		0x7a, 0x7a, 0xab, 0xab, 0xab, 0xab, 0xab, 0xab, 0x7a, 0x7a
	]);
});

test("zero count accepts null destination without dereferencing memory", () => {
	const registry = createNativeHostImportRegistry();
	registerNativeLibcByteHandlers(registry);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, 0x7777n);
	const result = registry.handle(
		Object.freeze({ name: "memset" }),
		Object.freeze({ registers })
	);
	assert.equal(result.result.count, "0");
	assert.equal(registers.read(0), 0n);
	assert.equal(registers.pc, 0x7777n);
});

test("invalid destination preserves registers and neighboring bytes", () => {
	const fixture = createFixture();
	fixture.memory.write(0x5000n, new Uint8Array([1, 2, 3, 4]));
	fixture.registers.write(0, 0x4fffn);
	fixture.registers.write(1, 9n);
	fixture.registers.write(2, 2n);
	assert.throws(
		function invokeInvalidDestination() {
			invoke(fixture);
		},
		function verifyBoundary(error) {
			return error.code === "NATIVE_ANONYMOUS_ADDRESS";
		}
	);
	assert.equal(fixture.registers.read(0), 0x4fffn);
	assert.equal(fixture.registers.pc, 0x9000n);
	assert.deepEqual([...fixture.memory.read(0x5000n, 4)], [1, 2, 3, 4]);
});

test("oversized count fails before allocation, memory, or register mutation", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 0x5000n);
	fixture.registers.write(1, 0xffn);
	fixture.registers.write(2, BigInt(MAX_LIBC_BYTE_TRANSFER) + 1n);
	assert.throws(
		function invokeOversizedMemset() {
			invoke(fixture);
		},
		function verifyBoundary(error) {
			return error.code === "NATIVE_LIBC_BYTE_COUNT";
		}
	);
	assert.equal(fixture.registers.read(0), 0x5000n);
	assert.equal(fixture.registers.pc, 0x9000n);
});

test("Flutter import registry exposes the measured memset capability", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	assert.ok(registry.snapshot().includes("memset"));
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x5000n, 64, "memset-test");
	const registry = createNativeHostImportRegistry();
	registerNativeLibcByteHandlers(registry);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, 0x7777n);
	return Object.freeze({ memory, registers, registry });
}

function invoke(fixture) {
	return fixture.registry.handle(
		Object.freeze({ name: "memset" }),
		Object.freeze({ memory: fixture.memory, registers: fixture.registers })
	);
}
