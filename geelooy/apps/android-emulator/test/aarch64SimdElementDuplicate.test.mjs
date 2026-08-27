//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves vector-element DUP across assembler-derived arrangements and aliases.
 * The Awtsmoos renews selected chamber through every destination lane;
 * Awtsmoos.com preserves register state while raw element light remains.
 */
test("authentic DUP V1.2D, V0.D[0] decodes and executes exactly", () => {
	const instruction = decodeAarch64Instruction(0x4e080401, 9068932n);
	assert.deepEqual(shape(instruction), {
		destination: 1,
		elementWidth: 64,
		family: "simd-element-duplicate",
		laneCount: 2,
		mnemonic: "dup",
		source: 0,
		sourceLane: 0,
		width: 128
	});
	const registers = createAarch64Registers({ nzcv: 9, stackPointer: 0x8800n });
	registers.write(8, 0x1234n);
	registers.writeVector(0, 0xfeedfacecafebeef0000000200008081n, 128);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(
		registers.readVector(1, 128),
		0x00000002000080810000000200008081n
	);
	assert.equal(registers.read(8), 0x1234n);
	assert.equal(registers.sp, 0x8800n);
	assert.equal(registers.nzcv, 9);
});

test("assembler-derived extreme B/H/S/D source lanes decode", () => {
	const cases = [
		[encode(0, 8, 15, 31, 30), 8, 15, 8, 64],
		[encode(1, 16, 7, 3, 2), 16, 7, 8, 128],
		[encode(1, 32, 3, 5, 4), 32, 3, 4, 128],
		[encode(1, 64, 1, 7, 6), 64, 1, 2, 128]
	];
	for (const [word, width, sourceLane, laneCount, vectorWidth] of cases) {
		const decoded = decodeAarch64Instruction(word);
		assert.deepEqual(
			[decoded.elementWidth, decoded.sourceLane, decoded.laneCount, decoded.width],
			[width, sourceLane, laneCount, vectorWidth]
		);
	}
});

test("source and destination V31 remain alias-safe", () => {
	const registers = createAarch64Registers({ programCounter: 0x4444n });
	registers.writeVector(31, 0xab000000000000000000000000000001n, 128);
	const instruction = decodeAarch64Instruction(encode(1, 8, 15, 31, 31));
	executeAarch64Data(instruction, registers);
	assert.equal(registers.readVector(31, 128), BigInt(`0x${"ab".repeat(16)}`));
	assert.equal(registers.pc, 0x4444n);
});

test("Q zero duplicates into 64 bits and clears the upper destination half", () => {
	const registers = createAarch64Registers();
	registers.writeVector(2, (1n << 128n) - 1n, 128);
	registers.writeVector(3, 0x00000000000000000000000000005a00n, 128);
	const instruction = decodeAarch64Instruction(encode(0, 8, 1, 3, 2));
	executeAarch64Data(instruction, registers);
	assert.equal(registers.readVector(2, 128), 0x5a5a5a5a5a5a5a5an);
});

test("reserved and neighboring copy words remain outside element DUP", () => {
	for (const word of [
		0x0e000400,
		encode(0, 64, 0, 0, 1),
		0x4e010c01,
		0x6e010401,
		0x4e001c00,
		0x00000000
	]) {
		assert.notEqual(
			decodeAarch64Instruction(word).family,
			"simd-element-duplicate"
		);
	}
});

function encode(q, elementWidth, sourceLane, source, destination) {
	const sizeShift = Math.log2(elementWidth / 8);
	const immediate = (sourceLane << (sizeShift + 1)) | (1 << sizeShift);
	return (0x0e000400 | (q << 30) | (immediate << 16)
		| (source << 5) | destination) >>> 0;
}

function shape(instruction) {
	const keys = ["destination", "elementWidth", "family", "laneCount",
		"mnemonic", "source", "sourceLane", "width"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
