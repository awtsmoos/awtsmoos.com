//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";

import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Memory } from "../core/native/aarch64ExecuteMemory.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

const OBSERVED_FLUTTER_LD1_S1 = 0x0d409120;

/**
 * Proves the real Flutter structure load updates one S lane without clearing its neighbors.
 * The Awtsmoos renews one word from memory while Awtsmoos.com preserves the vector whole;
 * the exact runtime opcode becomes generic architecture instead of an application role.
 */
test("observed Flutter LD1 S lane merges in place", function observedLaneLoad() {
	const fixture = createFixture();
	fixture.registers.write(9, 0x1010n);
	fixture.registers.writeVector(0, 0x112233445566778899aabbccddeeff00n, 128);
	writeBits(fixture.memory, 0x1010n, 0x12345678n, 32);
	const instruction = decodeAarch64Instruction(OBSERVED_FLUTTER_LD1_S1, 0x512044n);
	assert.equal(instruction.family, "load-store-simd-single-lane");
	assert.equal(instruction.width, 32);
	assert.equal(instruction.laneIndex, 1);
	assert.equal(executeAarch64Memory(instruction, fixture.registers, fixture.memory), true);
	assert.equal(fixture.registers.readVector(0, 128), 0x112233445566778812345678ddeeff00n);
	assert.equal(fixture.registers.read(9), 0x1010n);
});

test("assembler B H S D lane extremes decode exactly", function decodeMatrix() {
	assertLane(0x0d400020, 8, 0, true);
	assertLane(0x4d401c20, 8, 15, true);
	assertLane(0x4d405820, 16, 7, true);
	assertLane(0x4d409020, 32, 3, true);
	assertLane(0x4d408420, 64, 1, true);
	assertLane(0x4d001c20, 8, 15, false);
	assertLane(0x4d005820, 16, 7, false);
	assertLane(0x4d009020, 32, 3, false);
	assertLane(0x4d008420, 64, 1, false);
});

test("ST1 writes only the chosen lane and preserves V register", function storeLane() {
	const fixture = createFixture();
	fixture.registers.write(1, 0x1020n);
	const vector = 0x01020304050607081122334455667788n;
	fixture.registers.writeVector(0, vector, 128);
	const instruction = decodeAarch64Instruction(0x4d009020);
	assert.equal(executeAarch64Memory(instruction, fixture.registers, fixture.memory), true);
	assert.deepEqual([...fixture.memory.read(0x1020n, 4)], [0x04, 0x03, 0x02, 0x01]);
	assert.equal(fixture.registers.readVector(0, 128), vector);
});

test("immediate and register post-index update base after transfer", function postIndex() {
	const fixture = createFixture();
	fixture.registers.write(3, 0x1040n);
	writeBits(fixture.memory, 0x1040n, 0xaabbccddn, 32);
	const immediate = decodeAarch64Instruction(0x0ddf9062);
	executeAarch64Memory(immediate, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.read(3), 0x1044n);
	assert.equal(fixture.registers.readVector(2, 32), 0n);
	assert.equal((fixture.registers.readVector(2, 128) >> 32n) & 0xffffffffn, 0xaabbccddn);
	fixture.registers.write(5, 0x1060n);
	fixture.registers.write(6, 0x20n);
	fixture.registers.writeVector(4, 0xabcdefn << 32n, 128);
	const register = decodeAarch64Instruction(0x0d8690a4);
	executeAarch64Memory(register, fixture.registers, fixture.memory);
	assert.equal(fixture.registers.read(5), 0x1080n);
	assert.deepEqual([...fixture.memory.read(0x1060n, 4)], [0xef, 0xcd, 0xab, 0x00]);
});

test("SP base works and reserved lane shapes remain unknown", function spAndReserved() {
	const fixture = createFixture();
	fixture.registers.sp = 0x1080n;
	writeBits(fixture.memory, 0x1080n, 0x55667788n, 32);
	const spLoad = decodeAarch64Instruction(0x0d4093e7);
	executeAarch64Memory(spLoad, fixture.registers, fixture.memory);
	assert.equal((fixture.registers.readVector(7, 128) >> 32n) & 0xffffffffn, 0x55667788n);
	assert.equal(decodeAarch64Instruction(0x0d40a020).family, "unknown");
});

/** Checks one assembler word against width, lane, and load/store direction. */
function assertLane(word, width, laneIndex, load) {
	const instruction = decodeAarch64Instruction(word);
	assert.equal(instruction.family, "load-store-simd-single-lane");
	assert.equal(instruction.width, width);
	assert.equal(instruction.laneIndex, laneIndex);
	assert.equal(instruction.load, load);
	assert.equal(instruction.store, !load);
}

/** Builds a bounded guest memory/register fixture for lane transfers. */
function createFixture() {
	return Object.freeze({
		memory: createNativeAnonymousMemory(0x1000n, 512, "simd-single-lane-test"),
		registers: createAarch64Registers()
	});
}

/** Writes one little-endian integer payload into test guest memory. */
function writeBits(memory, address, value, width) {
	const bytes = new Uint8Array(width / 8);
	for (let index = 0; index < bytes.length; index += 1) {
		bytes[index] = Number((value >> BigInt(index * 8)) & 0xffn);
	}
	memory.write(address, bytes);
}
