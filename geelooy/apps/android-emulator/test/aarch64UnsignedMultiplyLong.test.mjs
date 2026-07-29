//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves unsigned widening multiply around the authentic Flutter allocation word.
 * The Awtsmoos recreates W sources, X accumulator, product, and modulo shore;
 * Awtsmoos.com preserves XZR, SP, and NZCV without host arithmetic shortcuts.
 */
test("authentic UMULL X24, W8, W9 decodes and executes", () => {
	const instruction = decodeAarch64Instruction(0x9ba97d18, 4922752n);
	assert.deepEqual(shape(instruction), {
		accumulator: 31,
		destination: 24,
		family: "unsigned-multiply-add-long",
		mnemonic: "umaddl",
		secondSource: 9,
		source: 8,
		sourceWidth: 32,
		subtract: false,
		width: 64
	});
	const registers = createAarch64Registers();
	registers.write(8, 10n, 32);
	registers.write(9, 24n, 32);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.read(24, 64, "zero"), 240n);
});

test("UMADDL zero-extends W sources and adds the X accumulator", () => {
	const result = run({ accumulator: 3, destination: 4,
		secondSource: 2, source: 1 }, {
		1: 0xffffffffn,
		2: 2n,
		3: 5n
	}, 4);
	assert.equal(result, 8589934595n);
});

test("UMSUBL subtracts and wraps at 64 bits", () => {
	const result = run({ accumulator: 3, destination: 4,
		secondSource: 2, source: 1, subtract: true }, {
		1: 5n,
		2: 2n,
		3: 3n
	}, 4);
	assert.equal(result, BigInt.asUintN(64, -7n));
});

test("unsigned multiply-long keeps XZR, SP, and NZCV semantics", () => {
	const registers = createAarch64Registers({ stackPointer: 0x8000n });
	registers.nzcv = 0b1010;
	registers.write(2, 99n, 32);
	const zero = decodeAarch64Instruction(encode({
		accumulator: 31,
		destination: 4,
		secondSource: 2,
		source: 31
	}));
	executeAarch64Data(zero, registers);
	assert.equal(registers.read(4, 64, "zero"), 0n);
	const discarded = decodeAarch64Instruction(encode({
		accumulator: 3,
		destination: 31,
		secondSource: 2,
		source: 1
	}));
	registers.write(1, 2n, 32);
	registers.write(2, 3n, 32);
	registers.write(3, 4n, 64);
	executeAarch64Data(discarded, registers);
	assert.equal(registers.read(31, 64, "zero"), 0n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.nzcv, 0b1010);
});

test("UMULH and invalid 32-bit widening neighbors remain unknown", () => {
	for (const word of [0x9bc00000, 0x1ba00000]) {
		assert.equal(decodeAarch64Instruction(word).family, "unknown");
	}
});

function run(fields, values, destination) {
	const instruction = decodeAarch64Instruction(encode(fields));
	const registers = createAarch64Registers();
	for (const [index, value] of Object.entries(values)) {
		registers.write(Number(index), value,
			Number(index) === fields.accumulator ? 64 : 32);
	}
	assert.equal(executeAarch64Data(instruction, registers), true);
	return registers.read(destination, 64, "zero");
}

function encode(fields) {
	return (0x9ba00000 + (fields.secondSource * 0x10000)
		+ (fields.subtract ? 0x8000 : 0) + (fields.accumulator * 0x400)
		+ (fields.source * 0x20) + fields.destination) >>> 0;
}

function shape(instruction) {
	const keys = ["accumulator", "destination", "family", "mnemonic",
		"secondSource", "source", "sourceWidth", "subtract", "width"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
