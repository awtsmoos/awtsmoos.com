//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Memory } from "../core/native/aarch64ExecuteMemory.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

/**
 * Proves SIMD/FP memory words mutate V lanes without corrupting X pointers.
 * The Awtsmoos recreates B, H, S, D, Q, address, and writeback anew; Awtsmoos.com
 * keeps every authentic payload inside repository-owned JavaScript vessels.
 */
test("authentic LDR D0 loads V0 and preserves pointer X0", () => {
	const fixture = createFixture(4096);
	const instruction = decodeAarch64Instruction(0xfd42b120, 9983544n);
	assert.equal(instruction.family, "load-store-simd-unsigned-immediate");
	assert.equal(instruction.registerClass, "vector");
	assert.equal(instruction.width, 64);
	assert.equal(instruction.immediate, 1376);
	fixture.registers.write(9, 0x1000n);
	fixture.registers.write(0, 0x7000n);
	fixture.memory.write(0x1560n, Uint8Array.from([2, 0, 0, 0, 11, 0, 0, 0]));
	assert.equal(executeAarch64Memory(instruction, fixture.registers, fixture.memory), true);
	assert.equal(fixture.registers.readVector(0, 64), 0x0000000b00000002n);
	assert.equal(fixture.registers.read(0), 0x7000n);
});

test("scalar B H S D loads clear upper vector lanes", () => {
	for (const [width, value] of [[8, 0xabn], [16, 0xabcdn], [32, 0x89abcdefn], [64, 0x0123456789abcdefn]]) {
		const fixture = createFixture();
		fixture.registers.write(3, 0x1000n);
		fixture.registers.writeVector(4, (1n << 127n) | 7n, 128);
		writeBits(fixture.memory, 0x1020n, value, width);
		const instruction = decodeAarch64Instruction(encodeUnsigned(true, width, 32, 3, 4));
		executeAarch64Memory(instruction, fixture.registers, fixture.memory);
		assert.equal(fixture.registers.readVector(4, 128), value);
	}
});

test("Q store and load preserve all 128 bits including V31", () => {
	const fixture = createFixture();
	const value = 0x112233445566778899aabbccddeeff00n;
	fixture.registers.write(5, 0x1000n);
	fixture.registers.writeVector(31, value, 128);
	executeAarch64Memory(
		decodeAarch64Instruction(encodeUnsigned(false, 128, 64, 5, 31)),
		fixture.registers,
		fixture.memory
	);
	fixture.registers.writeVector(31, 0n, 128);
	executeAarch64Memory(
		decodeAarch64Instruction(encodeUnsigned(true, 128, 64, 5, 31)),
		fixture.registers,
		fixture.memory
	);
	assert.equal(fixture.registers.readVector(31, 128), value);
});

test("signed pre-index and post-index forms update base exactly", () => {
	const fixture = createFixture();
	fixture.registers.write(6, 0x1020n);
	writeBits(fixture.memory, 0x1018n, 0x3f800000n, 32);
	const pre = decodeAarch64Instruction(encodeSigned(true, 32, -8, 3, 6, 1));
	executeAarch64Memory(pre, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.read(6), 0x1018n);
	assert.equal(fixture.registers.readVector(1, 32), 0x3f800000n);
	fixture.registers.writeVector(2, 0x1234n, 16);
	const post = decodeAarch64Instruction(encodeSigned(false, 16, 6, 1, 6, 2));
	executeAarch64Memory(post, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.read(6), 0x101en);
	assert.deepEqual([...fixture.memory.read(0x1018n, 2)], [0x34, 0x12]);
});

test("reserved SIMD shapes stay unknown and integer forms stay integer", () => {
	const reserved = (0x3d000000 + 0x40000000 + 0x00800000) >>> 0;
	assert.equal(decodeAarch64Instruction(reserved).family, "unknown");
	assert.equal(decodeAarch64Instruction(0xf9400020).family, "load-store-unsigned-immediate");
});

function createFixture(size = 512) {
	return Object.freeze({
		memory: createNativeAnonymousMemory(0x1000n, size, "simd-memory-test"),
		registers: createAarch64Registers()
	});
}

function encodeUnsigned(load, width, offset, base, register) {
	const size = width === 128 ? 0 : Math.log2(width / 8);
	const operation = width === 128 ? (load ? 3 : 2) : (load ? 1 : 0);
	return (0x3d000000 + (size * 0x40000000) + (operation * 0x00400000)
		+ ((offset / (width / 8)) * 0x400) + (base * 0x20) + register) >>> 0;
}

function encodeSigned(load, width, displacement, mode, base, register) {
	const size = Math.log2(width / 8);
	const operation = load ? 1 : 0;
	const immediate = displacement & 0x1ff;
	return (0x3c000000 + (size * 0x40000000) + (operation * 0x00400000)
		+ (immediate * 0x1000) + (mode * 0x400) + (base * 0x20) + register) >>> 0;
}

function writeBits(memory, address, value, width) {
	const bytes = new Uint8Array(width / 8);
	for (let index = 0; index < bytes.length; index += 1) {
		bytes[index] = Number((value >> BigInt(index * 8)) & 0xffn);
	}
	memory.write(address, bytes);
}
