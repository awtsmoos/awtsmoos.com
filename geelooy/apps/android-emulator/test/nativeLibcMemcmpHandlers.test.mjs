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

const RETURN_ADDRESS = 0x7777n;

test("memcmp compares an authentic-style twenty-three-byte range", () => {
	const fixture = createFixture();
	const bytes = Uint8Array.from({ length: 23 }, (_, index) => index * 7);
	fixture.memory.write(0x5000n, bytes);
	fixture.memory.write(0x5040n, bytes);
	let handled = invoke(fixture, 0x5000n, 0x5040n, 23n);
	assert.equal(handled.result.result, 0);
	assert.equal(handled.result.comparedBytes, 23);
	assert.equal(fixture.registers.read(0, 32), 0n);
	const changed = Uint8Array.from(bytes);
	changed[22] = 255;
	fixture.memory.write(0x5040n, changed);
	handled = invoke(fixture, 0x5000n, 0x5040n, 23n);
	assert.equal(handled.result.firstDifferenceIndex, 22);
	assert.equal(handled.result.result, bytes[22] - 255);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("memcmp returns exact signed differences at first and middle bytes", () => {
	const fixture = createFixture();
	fixture.memory.write(0x5000n, Uint8Array.from([0, 5, 200, 0]));
	fixture.memory.write(0x5040n, Uint8Array.from([255, 5, 100, 0]));
	let handled = invoke(fixture, 0x5000n, 0x5040n, 4n);
	assert.equal(handled.result.result, -255);
	assert.equal(fixture.registers.read(0, 32), 0xffffff01n);
	fixture.memory.write(0x5040n, Uint8Array.from([0, 5, 100, 0]));
	handled = invoke(fixture, 0x5000n, 0x5040n, 4n);
	assert.equal(handled.result.result, 100);
	assert.equal(handled.result.comparedBytes, 3);
});

test("identical and overlapping pointers compare without mutation", () => {
	const fixture = createFixture();
	const bytes = Uint8Array.from([9, 8, 7, 6, 5, 4]);
	fixture.memory.write(0x5000n, bytes);
	assert.equal(invoke(fixture, 0x5000n, 0x5000n, 6n).result.result, 0);
	assert.equal(invoke(fixture, 0x5000n, 0x5001n, 5n).result.result, 1);
	assert.deepEqual([...fixture.memory.read(0x5000n, 6)], [...bytes]);
});

test("zero count accepts null pointers without a memory object", () => {
	const registry = createNativeHostImportRegistry();
	registerNativeLibcByteHandlers(registry);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, RETURN_ADDRESS);
	const handled = registry.handle(
		Object.freeze({ name: "memcmp" }),
		Object.freeze({ registers })
	);
	assert.equal(handled.result.result, 0);
	assert.equal(handled.result.comparedBytes, 0);
	assert.equal(registers.pc, RETURN_ADDRESS);
});

test("invalid ranges and oversized counts preserve X0 and PC", () => {
	for (const [left, right, count, code] of [
		[0x4fffn, 0x5040n, 2n, "NATIVE_ANONYMOUS_ADDRESS"],
		[0x5000n, 0x50ffn, 2n, "NATIVE_ANONYMOUS_ADDRESS"],
		[0x5000n, 0x5040n, BigInt(MAX_LIBC_BYTE_TRANSFER) + 1n,
			"NATIVE_LIBC_BYTE_COUNT"]
	]) {
		const fixture = createFixture();
		assert.throws(() => invoke(fixture, left, right, count), error => error.code === code);
		assert.equal(fixture.registers.read(0), left);
		assert.equal(fixture.registers.pc, 0x9000n);
	}
});

test("Flutter registry exposes memcmp, memchr, and memset", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	for (const name of ["memcmp", "memchr", "memset"]) {
		assert.ok(registry.snapshot().includes(name));
	}
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x5000n, 0x100, "memcmp-test");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, RETURN_ADDRESS);
	const registry = createNativeHostImportRegistry();
	registerNativeLibcByteHandlers(registry);
	return Object.freeze({ memory, registers, registry });
}

function invoke(fixture, left, right, count) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, left);
	fixture.registers.write(1, right);
	fixture.registers.write(2, count);
	return fixture.registry.handle(
		Object.freeze({ name: "memcmp" }),
		Object.freeze({ memory: fixture.memory, registers: fixture.registers })
	);
}
