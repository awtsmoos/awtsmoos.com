//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { aarch64FloatToIntegerValue } from "../core/native/aarch64FloatToIntegerValue.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const SUBOPCODES = Object.freeze({
	fcvtas: 4, fcvtau: 5, fcvtms: 16, fcvtmu: 17, fcvtns: 0,
	fcvtnu: 1, fcvtps: 8, fcvtpu: 9, fcvtzs: 24, fcvtzu: 25
});

test("authentic FCVTPU X9, S0 rounds toward positive infinity", () => {
	const instruction = decodeAarch64Instruction(0x9e290009, 10490656n);
	assert.equal(instruction.mnemonic, "fcvtpu");
	assert.equal(instruction.destinationWidth, 64);
	assert.equal(instruction.sourceWidth, 32);
	const registers = createAarch64Registers({ nzcv: 9, stackPointer: 0x8000n });
	registers.writeFloat(0, 1.25, 32);
	executeAarch64Data(instruction, registers);
	assert.equal(registers.read(9), 2n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.nzcv, 9);
});

test("all ten rounding mnemonics decode across W/X and S/D", () => {
	for (const [mnemonic, subopcode] of Object.entries(SUBOPCODES)) {
		for (const destinationWidth of [32, 64]) {
			for (const sourceWidth of [32, 64]) {
				const decoded = decodeAarch64Instruction(encode({
					destinationWidth, sourceWidth, subopcode
				}));
				assert.equal(decoded.mnemonic, mnemonic);
				assert.equal(decoded.destinationWidth, destinationWidth);
				assert.equal(decoded.sourceWidth, sourceWidth);
			}
		}
	}
});

test("nearest-even and nearest-away resolve positive and negative ties", () => {
	for (const [value, even, away] of [
		[1.5, 2n, 2n], [2.5, 2n, 3n], [-1.5, -2n, -2n], [-2.5, -2n, -3n]
	]) {
		assert.equal(aarch64FloatToIntegerValue(value, 64, true, "nearest-even"), even);
		assert.equal(aarch64FloatToIntegerValue(value, 64, true, "nearest-away"), away);
	}
});

test("directed modes preserve ceil, floor, and truncation asymmetry", () => {
	assert.equal(aarch64FloatToIntegerValue(-1.25, 64, true, "positive"), -1n);
	assert.equal(aarch64FloatToIntegerValue(-1.25, 64, true, "negative"), -2n);
	assert.equal(aarch64FloatToIntegerValue(-1.75, 64, true), -1n);
	assert.equal(aarch64FloatToIntegerValue(-1.25, 64, false, "negative"), 0n);
});

test("rounding preserves saturation, NaN, infinity, and zero destination", () => {
	assert.equal(aarch64FloatToIntegerValue(Number.NaN, 32, true, "positive"), 0n);
	assert.equal(aarch64FloatToIntegerValue(Infinity, 32, false, "positive"), 4294967295n);
	assert.equal(aarch64FloatToIntegerValue(-Infinity, 32, true, "negative"), -2147483648n);
	const registers = createAarch64Registers({ stackPointer: 0x9000n });
	registers.writeFloat(1, 3.5, 64);
	const instruction = decodeAarch64Instruction(encode({
		destination: 31, destinationWidth: 64, source: 1,
		sourceWidth: 64, subopcode: SUBOPCODES.fcvtps
	}));
	executeAarch64Data(instruction, registers);
	assert.equal(registers.read(31), 0n);
	assert.equal(registers.sp, 0x9000n);
});

test("fixed-point and reserved rounding subopcodes remain unknown", () => {
	const base = encode({ subopcode: SUBOPCODES.fcvtps });
	for (const word of [base | (1 << 10), encode({ subopcode: 10 }), 0x00000000]) {
		assert.equal(decodeAarch64Instruction(word >>> 0).family, "unknown");
	}
});

function encode(options = {}) {
	let word = 0x1e200000;
	if ((options.destinationWidth ?? 32) === 64) word |= 0x80000000;
	if ((options.sourceWidth ?? 32) === 64) word |= 1 << 22;
	word |= ((options.subopcode ?? 0) & 31) << 16;
	word |= ((options.source ?? 1) & 31) << 5;
	word |= (options.destination ?? 2) & 31;
	return word >>> 0;
}
