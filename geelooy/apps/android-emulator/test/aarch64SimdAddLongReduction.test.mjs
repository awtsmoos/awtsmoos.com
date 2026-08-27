//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const LEGAL_WORDS = Object.freeze([
	[0x0e303820, "saddlv", 8, 8, 16],
	[0x4e303862, "saddlv", 16, 8, 16],
	[0x2e3038a4, "uaddlv", 8, 8, 16],
	[0x6e3038e6, "uaddlv", 16, 8, 16],
	[0x0e703928, "saddlv", 4, 16, 32],
	[0x4e70396a, "saddlv", 8, 16, 32],
	[0x2e7039ac, "uaddlv", 4, 16, 32],
	[0x6e7039ee, "uaddlv", 8, 16, 32],
	[0x4eb03a30, "saddlv", 4, 32, 64],
	[0x6eb03a72, "uaddlv", 4, 32, 64]
]);

test("authentic UADDLV H0, V0.8B decodes and sums one", () => {
	const instruction = decodeAarch64Instruction(0x2e303800, 10490700n);
	assert.equal(instruction.family, "simd-add-long-reduction");
	assert.equal(instruction.mnemonic, "uaddlv");
	assert.equal(instruction.destinationWidth, 16);
	const registers = createAarch64Registers({ nzcv: 2, stackPointer: 0x8000n });
	registers.write(8, 0x1234n);
	registers.writeVector(0, 1n, 128);
	executeAarch64Data(instruction, registers);
	assert.equal(registers.readVector(0, 128), 1n);
	assert.equal(registers.read(8), 0x1234n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.nzcv, 2);
});

test("all assembler-proven arrangements decode exactly", () => {
	for (const [word, mnemonic, laneCount, elementWidth, destinationWidth] of LEGAL_WORDS) {
		const decoded = decodeAarch64Instruction(word);
		assert.equal(decoded.mnemonic, mnemonic);
		assert.equal(decoded.laneCount, laneCount);
		assert.equal(decoded.elementWidth, elementWidth);
		assert.equal(decoded.destinationWidth, destinationWidth);
	}
});

test("signed byte lanes sign-extend before widening addition", () => {
	const value = pack([0xff, 0xfe, 1, 2, 0x80, 0x7f, 3, 4], 8);
	assert.equal(run(0x0e303820, 1, value, 0), 6n);
});

test("unsigned byte and word extrema sum without signed reinterpretation", () => {
	assert.equal(run(0x2e3038a4, 5, pack(Array(8).fill(0xff), 8), 4), 2040n);
	assert.equal(run(0x6eb03a72, 19, pack(Array(4).fill(0xffffffff), 32), 18), 0x3fffffffcn);
});

test("V31 aliasing clears upper scalar bits and preserves the source snapshot", () => {
	const registers = createAarch64Registers();
	registers.writeVector(31, pack(Array(16).fill(1), 8), 128);
	const instruction = decodeAarch64Instruction(encode(1, 1, 0, 31, 31));
	executeAarch64Data(instruction, registers);
	assert.equal(registers.readVector(31, 128), 16n);
});

test("illegal arrangements and neighboring ADDV remain outside the family", () => {
	for (const word of [
		encode(0, 0, 2, 1, 0),
		encode(0, 1, 2, 1, 0),
		encode(0, 0, 3, 1, 0),
		0x0e31b8c5,
		0x00000000
	]) {
		assert.notEqual(decodeAarch64Instruction(word).family, "simd-add-long-reduction");
	}
});

function run(word, source, value, destination) {
	const instruction = decodeAarch64Instruction(word);
	const registers = createAarch64Registers();
	registers.writeVector(source, value, instruction.sourceWidth);
	executeAarch64Data(instruction, registers);
	return registers.readVector(destination, instruction.destinationWidth);
}

function encode(q, unsigned, size, source, destination) {
	return (0x0e303800 | (q << 30) | (unsigned << 29)
		| (size << 22) | (source << 5) | destination) >>> 0;
}

function pack(values, width) {
	return values.reduce((result, value, index) => {
		return result | (BigInt(value) << BigInt(index * width));
	}, 0n);
}
