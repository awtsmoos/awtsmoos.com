//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { aarch64IntegerToFloatValue } from "../core/native/aarch64IntegerToFloatValue.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves fixed SCVTF/UCVTF execution and exact IEEE ties-to-even rounding.
 * The Awtsmoos renews fraction, halfway bit, vector vessel, and register silence;
 * Awtsmoos.com admits no app-specific arithmetic or second-rounding alliance.
 */
test("authentic UCVTF S0, X8, #1 writes 524288 exactly", () => {
	const instruction = decodeAarch64Instruction(0x9e03fd00, 9508828n);
	const registers = createAarch64Registers({
		nzcv: 6,
		programCounter: 9508828n,
		stackPointer: 0x8000n
	});
	registers.write(8, 1048576n);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readFloat(0, 32), 524288);
	assert.equal(registers.readVector(0, 128), 0x49000000n);
	assert.equal(registers.read(8), 1048576n);
	assert.equal(registers.pc, 9508828n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.nzcv, 6);
});

test("signed fractions and zero-register sources preserve exact meaning", () => {
	assert.equal(run(encodeFixed(true, 32, 64, 1), 0xffffffffn), -0.5);
	assert.equal(run(encodeFixed(false, 64, 64, 64), 1n), 2 ** -64);
	const registers = createAarch64Registers({ stackPointer: 0x9000n, nzcv: 9 });
	const instruction = decodeAarch64Instruction(encode({
		destination: 31,
		destinationWidth: 64,
		fractionalBits: 17,
		signed: false,
		source: 31,
		sourceWidth: 64
	}));
	executeAarch64Data(instruction, registers);
	assert.equal(registers.readFloat(31, 64), 0);
	assert.equal(registers.readVector(31, 128), 0n);
	assert.equal(registers.sp, 0x9000n);
	assert.equal(registers.nzcv, 9);
});

test("float32 halfway cases round to even without double rounding", () => {
	const even = (1n << 25n) + 1n;
	const odd = (1n << 25n) + 3n;
	assert.equal(aarch64IntegerToFloatValue(even, 1, 32), 16777216);
	assert.equal(aarch64IntegerToFloatValue(odd, 1, 32), 16777218);
	assert.equal(aarch64IntegerToFloatValue(-even, 1, 32), -16777216);
	assert.equal(aarch64IntegerToFloatValue(-odd, 1, 32), -16777218);
});

function run(word, value) {
	const instruction = decodeAarch64Instruction(word);
	const registers = createAarch64Registers();
	registers.write(instruction.source, value, instruction.sourceWidth);
	executeAarch64Data(instruction, registers);
	return registers.readFloat(instruction.destination, instruction.destinationWidth);
}

function encodeFixed(signed, sourceWidth, destinationWidth, fractionalBits) {
	return encode({
		destination: 2,
		destinationWidth,
		fractionalBits,
		signed,
		source: 1,
		sourceWidth
	});
}

function encode(options) {
	let word = 0x1e020000;
	if ((options.sourceWidth ?? 32) === 64) word |= 0x80000000;
	if ((options.destinationWidth ?? 32) === 64) word |= 1 << 22;
	if (!(options.signed ?? true)) word |= 1 << 16;
	word |= ((64 - (options.fractionalBits ?? 1)) & 63) << 10;
	word |= ((options.source ?? 1) & 31) << 5;
	word |= (options.destination ?? 2) & 31;
	return word >>> 0;
}
