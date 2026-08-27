//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves AdvSIMD CNT over authentic 8B and generic 16B vector arrangements.
 * The Awtsmoos recreates every byte's hidden sparks as a bounded lane count;
 * Awtsmoos.com keeps aliasing, V31, and upper silence architecturally exact.
 */
test("authentic CNT V0.8B, V0.8B decodes and counts scalar two", () => {
	const instruction = decodeAarch64Instruction(0x0e205800, 10490696n);
	assert.deepEqual(shape(instruction), {
		destination: 0,
		elementWidth: 8,
		family: "simd-byte-unary",
		laneCount: 8,
		mnemonic: "cnt",
		source: 0,
		width: 64
	});
	const registers = createAarch64Registers({ nzcv: 10, stackPointer: 0x8000n });
	registers.write(8, 0x1234n);
	registers.writeVector(0, 0xffffffffffffffff0000000000000002n, 128);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readVector(0, 128), 1n);
	assert.equal(registers.read(8), 0x1234n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.nzcv, 10);
});

test("8B lanes produce independent population counts", () => {
	const input = pack([0x00, 0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0xff]);
	const expected = pack([0, 1, 2, 3, 4, 5, 6, 8]);
	assert.equal(run(0x0e205820, 1, input, 0, 128), expected);
});

test("16B covers every count zero through eight and distinct registers", () => {
	const bytes = [0x00, 0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f,
		0xff, 0x55, 0xaa, 0x80, 0x81, 0xf0, 0xfe, 0x11];
	const counts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 4, 4, 1, 2, 4, 7, 2];
	assert.equal(run(0x4e205841, 2, pack(bytes), 1, 128), pack(counts));
});

test("V31 is a real source and destination with alias-safe execution", () => {
	const registers = createAarch64Registers();
	registers.writeVector(31, pack([0xff, 0, 1, 3, 7, 15, 31, 63]), 64);
	const instruction = decodeAarch64Instruction(0x0e205bff);
	executeAarch64Data(instruction, registers);
	assert.equal(registers.readVector(31, 64), pack([8, 0, 1, 2, 3, 4, 5, 6]));
});

test("RBIT, REV16, and malformed CNT neighbors remain outside the family", () => {
	for (const word of [0x2e605883, 0x0e2018c5, 0x0e205c00, 0x00000000]) {
		assert.notEqual(decodeAarch64Instruction(word).family, "simd-byte-unary");
	}
});

function run(word, source, value, destination, sourceWidth) {
	const registers = createAarch64Registers();
	registers.writeVector(source, value, sourceWidth);
	const instruction = decodeAarch64Instruction(word);
	executeAarch64Data(instruction, registers);
	return registers.readVector(destination, instruction.width);
}

function pack(bytes) {
	return bytes.reduce((value, byte, index) => {
		return value | (BigInt(byte) << BigInt(index * 8));
	}, 0n);
}

function shape(instruction) {
	const keys = ["destination", "elementWidth", "family", "laneCount",
		"mnemonic", "source", "width"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
