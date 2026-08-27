//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import {
	MAX_LIBC_BYTE_TRANSFER,
	registerNativeLibcByteHandlers
} from "../core/native/nativeLibcByteHandlers.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const RETURN_ADDRESS = 0x7777n;

/**
 * Proves memchr searches bounded guest bytes without host libc or text decoding.
 * The Awtsmoos recreates first match, absent shore, and low-byte meaning anew;
 * Awtsmoos.com returns only authentic guest addresses or null.
 */
test("memchr returns the first authentic equals byte", () => {
	const fixture = createFixture(Uint8Array.from([97, 61, 98, 61, 99]));
	const handled = invoke(fixture, 0x5000n, 61n, 5n);
	assert.equal(handled.result.operation, "memchr");
	assert.equal(handled.result.index, 1);
	assert.equal(fixture.registers.read(0), 0x5001n);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	assert.deepEqual([...fixture.memory.read(0x5000n, 5)], [97, 61, 98, 61, 99]);
});

test("memchr handles final, missing, binary zero, and low-byte truncation", () => {
	const fixture = createFixture(Uint8Array.from([7, 0, 9, 0xab]));
	assert.equal(invoke(fixture, 0x5000n, 0n, 4n).result.index, 1);
	assert.equal(fixture.registers.read(0), 0x5001n);
	assert.equal(invoke(fixture, 0x5000n, 0x1abn, 4n).result.index, 3);
	assert.equal(fixture.registers.read(0), 0x5003n);
	assert.equal(invoke(fixture, 0x5000n, 0xffn, 4n).result.index, -1);
	assert.equal(fixture.registers.read(0), 0n);
});

test("zero count accepts an invalid source without reading", () => {
	const registry = createNativeHostImportRegistry();
	registerNativeLibcByteHandlers(registry);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(0, 0xffffn);
	registers.write(1, 61n);
	registers.write(2, 0n);
	registers.write(30, RETURN_ADDRESS);
	const handled = registry.handle(
		Object.freeze({ name: "memchr" }),
		Object.freeze({ registers })
	);
	assert.equal(handled.result.index, -1);
	assert.equal(registers.read(0), 0n);
	assert.equal(registers.pc, RETURN_ADDRESS);
});

test("invalid memory and oversized counts fail before register mutation", () => {
	const fixture = createFixture(Uint8Array.from([1, 2, 3]));
	assert.throws(
		() => invoke(fixture, 0x4fffn, 2n, 2n),
		error => error.code === "NATIVE_ANONYMOUS_ADDRESS"
	);
	assert.equal(fixture.registers.read(0), 0x4fffn);
	assert.equal(fixture.registers.pc, 0x9000n);
	assert.throws(
		() => invoke(
			fixture,
			0x5000n,
			2n,
			BigInt(MAX_LIBC_BYTE_TRANSFER) + 1n
		),
		error => error.code === "NATIVE_LIBC_BYTE_COUNT"
	);
});

test("the libc byte registry exposes memcmp, memchr, and memset", () => {
	const registry = createNativeHostImportRegistry();
	registerNativeLibcByteHandlers(registry);
	assert.deepEqual(
		[...registry.snapshot()].sort(),
		["memchr", "memcmp", "memset"]
	);
});

function createFixture(bytes) {
	const memory = createNativeAnonymousMemory(0x5000n, 64, "memchr-test");
	memory.write(0x5000n, bytes);
	const registry = createNativeHostImportRegistry();
	registerNativeLibcByteHandlers(registry);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, RETURN_ADDRESS);
	return Object.freeze({ memory, registers, registry });
}

function invoke(fixture, source, byte, count) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, source);
	fixture.registers.write(1, byte);
	fixture.registers.write(2, count);
	return fixture.registry.handle(
		Object.freeze({ name: "memchr" }),
		Object.freeze({ memory: fixture.memory, registers: fixture.registers })
	);
}
