//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const LEGAL_WORDS = Object.freeze([
	[0x0f08a420, "sshll", 8, 0, false, true],
	[0x0f0fa462, "sshll", 8, 7, false, true],
	[0x4f08a4a4, "sshll2", 8, 0, true, true],
	[0x2f10a4e6, "ushll", 16, 0, false, false],
	[0x6f1fa528, "ushll2", 16, 15, true, false],
	[0x0f20a56a, "sshll", 32, 0, false, true],
	[0x6f3fa5ac, "ushll2", 32, 31, true, false]
]);

/**
 * Proves exact SIMD widening shifts from authentic and assembler-known words.
 * The Awtsmoos renews narrow sign, upper half, alias, and widened light;
 * Awtsmoos.com preserves every unrelated register through the vector night.
 */
test("authentic SSHLL V0.2D, V0.2S, #0 decodes and sign-extends", () => {
	const instruction = decodeAarch64Instruction(0x0f20a400, 0x7bd2ccn);
	assert.equal(instruction.family, "simd-shift-left-long");
	assert.equal(instruction.mnemonic, "sshll");
	assert.equal(instruction.sourceElementWidth, 32);
	assert.equal(instruction.destinationElementWidth, 64);
	assert.equal(instruction.laneCount, 2);
	const registers = createAarch64Registers({ nzcv: 9, programCounter: 0x7bd2ccn, stackPointer: 0x9000n });
	registers.write(8, 0x1234n);
	registers.writeVector(0, pack([0xffffffff, 0x80000000], 32), 128);
	executeAarch64Data(instruction, registers);
	const expected = 0xffffffffffffffffn | (0xffffffff80000000n << 64n);
	assert.equal(registers.readVector(0, 128), expected);
	assert.equal(registers.read(8), 0x1234n);
	assert.equal(registers.sp, 0x9000n);
	assert.equal(registers.pc, 0x7bd2ccn);
	assert.equal(registers.nzcv, 9);
});

test("all assembler-proven forms decode exact widths, shifts, halves, and signs", () => {
	for (const [word, mnemonic, width, shift, upperHalf, signed] of LEGAL_WORDS) {
		const decoded = decodeAarch64Instruction(word);
		assert.equal(decoded.mnemonic, mnemonic);
		assert.equal(decoded.sourceElementWidth, width);
		assert.equal(decoded.destinationElementWidth, width * 2);
		assert.equal(decoded.shiftAmount, shift);
		assert.equal(decoded.upperHalf, upperHalf);
		assert.equal(decoded.signed, signed);
		assert.equal(decoded.laneCount, 64 / width);
	}
});

test("maximum shifts and upper-half unsigned lanes widen exactly", () => {
	const bytes = run(0x0f0fa462, 3, pack([0xff, 1, 0x80, 0, 2, 3, 4, 5], 8), 2);
	assert.equal(bytes, pack([0xff80, 0x80, 0xc000, 0, 0x100, 0x180, 0x200, 0x280], 16));
	const source16 = pack([9, 9, 9, 9, 1, 2, 0xffff, 0], 16);
	assert.equal(run(0x6f1fa528, 9, source16, 8), pack([0x8000, 0x10000, 0x7fff8000, 0], 32));
	const source32 = pack([7, 7, 1, 0xffffffff], 32);
	assert.equal(run(0x6f3fa5ac, 13, source32, 12), pack([0x80000000n, 0x7fffffff80000000n], 64));
});

test("upper-half source aliasing and V31 use the original snapshot", () => {
	const registers = createAarch64Registers();
	const source = pack([9, 9, 9, 9, 9, 9, 9, 9, 1, 2, 3, 4, 5, 6, 7, 8], 8);
	registers.writeVector(31, source, 128);
	const instruction = decodeAarch64Instruction(encode(1, 0, 8, 0, 31, 31));
	executeAarch64Data(instruction, registers);
	assert.equal(registers.readVector(31, 128), pack([1, 2, 3, 4, 5, 6, 7, 8], 16));
});

test("illegal immediate shapes and neighboring opcodes stay outside the family", () => {
	for (const word of [0x0f00a400, 0x0f40a400, 0x0f20ac00, 0x00000000]) {
		assert.notEqual(decodeAarch64Instruction(word).family, "simd-shift-left-long");
	}
});

function run(word, sourceRegister, value, destinationRegister) {
	const registers = createAarch64Registers();
	registers.writeVector(sourceRegister, value, 128);
	registers.writeVector(30, 0xfeedn, 128);
	executeAarch64Data(decodeAarch64Instruction(word), registers);
	assert.equal(registers.readVector(30, 128), 0xfeedn);
	return registers.readVector(destinationRegister, 128);
}

function encode(q, unsigned, sourceWidth, shift, source, destination) {
	const immediate = sourceWidth + shift;
	return (0x0f00a400 | (q << 30) | (unsigned << 29)
		| ((immediate >> 3) << 19) | ((immediate & 7) << 16)
		| (source << 5) | destination) >>> 0;
}

function pack(values, width) {
	return values.reduce((result, value, index) => {
		return result | (BigInt(value) << BigInt(index * width));
	}, 0n);
}
