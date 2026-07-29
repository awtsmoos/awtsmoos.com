//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves exact W/X UDIV and SDIV around the authentic Flutter instruction.
 * The Awtsmoos recreates sign, zero-divisor law, quotient, width, and XZR anew;
 * Awtsmoos.com needs no host CPU, native disassembler, or guessed arithmetic.
 */
test("authentic SDIV X9, X9, X22 decodes and executes", () => {
	const instruction = decodeAarch64Instruction(0x9ad60d29, 0xa0de90n);
	assert.deepEqual(shape(instruction), {
		destination: 9,
		divisor: 22,
		family: "integer-division",
		mnemonic: "sdiv",
		signed: true,
		source: 9,
		width: 64
	});
	assert.equal(run(instruction, 9, 240n, 22, 24n), 10n);
});

test("UDIV and SDIV support W and X widths", () => {
	assert.equal(runWord(encode(false, 32, 1, 2, 3), 1, 20n, 2, 6n, 3), 3n);
	assert.equal(runWord(encode(false, 64, 1, 2, 3), 1,
		0xffffffffffffffffn, 2, 3n, 3), 0x5555555555555555n);
	assert.equal(runWord(encode(true, 32, 1, 2, 3), 1,
		0xfffffff9n, 2, 3n, 3), 0xfffffffen);
	assert.equal(runWord(encode(true, 64, 1, 2, 3), 1,
		BigInt.asUintN(64, -7n), 2, 3n, 3), BigInt.asUintN(64, -2n));
});

test("division by zero returns zero and signed overflow preserves minimum", () => {
	for (const signed of [false, true]) {
		assert.equal(runWord(encode(signed, 64, 1, 2, 3), 1, 99n, 2, 0n, 3), 0n);
	}
	assert.equal(runWord(encode(true, 64, 1, 2, 3), 1,
		0x8000000000000000n, 2, 0xffffffffffffffffn, 3),
	0x8000000000000000n);
	assert.equal(runWord(encode(true, 32, 1, 2, 3), 1,
		0x80000000n, 2, 0xffffffffn, 3), 0x80000000n);
});

test("division uses XZR and preserves SP and NZCV", () => {
	const registers = createAarch64Registers({ stackPointer: 0x9000n, nzcv: 0b1010 });
	registers.write(1, 100n);
	const zeroDivisor = decodeAarch64Instruction(encode(false, 64, 1, 31, 4));
	executeAarch64Data(zeroDivisor, registers);
	assert.equal(registers.read(4), 0n);
	const discarded = decodeAarch64Instruction(encode(false, 64, 1, 4, 31));
	registers.write(4, 5n);
	executeAarch64Data(discarded, registers);
	assert.equal(registers.read(31), 0n);
	assert.equal(registers.sp, 0x9000n);
	assert.equal(registers.nzcv, 0b1010);
});

test("neighboring two-source operations retain their proven families", () => {
	assert.equal(decodeAarch64Instruction(0x9ac02000).family, "variable-shift");
	assert.equal(decodeAarch64Instruction(0x9ac02400).family, "variable-shift");
	assert.equal(decodeAarch64Instruction(0x9ac04000).family, "unknown");
});

function runWord(word, leftIndex, left, rightIndex, right, destination) {
	return run(decodeAarch64Instruction(word), leftIndex, left,
		rightIndex, right, destination);
}

function run(instruction, leftIndex, left, rightIndex, right, destination = 9) {
	const registers = createAarch64Registers();
	registers.write(leftIndex, left, instruction.width);
	registers.write(rightIndex, right, instruction.width);
	assert.equal(executeAarch64Data(instruction, registers), true);
	return registers.read(destination, instruction.width);
}

function encode(signed, width, source, divisor, destination) {
	const base = signed ? 0x1ac00c00 : 0x1ac00800;
	return (base + (width === 64 ? 0x80000000 : 0)
		+ (divisor * 0x10000) + (source * 0x20) + destination) >>> 0;
}

function shape(instruction) {
	const keys = ["destination", "divisor", "family", "mnemonic",
		"signed", "source", "width"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
