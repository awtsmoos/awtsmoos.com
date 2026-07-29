//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves signed widening multiplication around the authentic Flutter opcode.
 * The Awtsmoos recreates sign, product, accumulator, modulo shore, and XZR anew;
 * Awtsmoos.com needs no host CPU, disassembler, APK shortcut, or guessed result.
 */
test("authentic SMADDL X0, W8, W19, X9 decodes and executes", () => {
	const instruction = decodeAarch64Instruction(0x9b332500, 5361056n);
	assert.deepEqual(selectShape(instruction), {
		accumulator: 9,
		destination: 0,
		family: "signed-multiply-add-long",
		mnemonic: "smaddl",
		secondSource: 19,
		source: 8,
		sourceWidth: 32,
		subtract: false,
		width: 64
	});
	const registers = createAarch64Registers();
	registers.write(8, 8n, 32);
	registers.write(19, 0n, 32);
	registers.write(9, 0n, 64);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.read(0), 0n);
});

test("SMADDL sign-extends both W sources and wraps at X width", () => {
	assert.equal(run({ accumulator: 3, destination: 4, secondSource: 2, source: 1 }, {
		1: 0xffffffffn,
		2: 3n,
		3: 10n
	}, 4), 7n);
	assert.equal(run({ accumulator: 3, destination: 4, secondSource: 2, source: 1 }, {
		1: 1n,
		2: 1n,
		3: 0xffffffffffffffffn
	}, 4), 0n);
});

test("SMSUBL subtracts the signed product from the X accumulator", () => {
	assert.equal(run({
		accumulator: 7,
		destination: 8,
		secondSource: 6,
		source: 5,
		subtract: true
	}, {
		5: 0xfffffffen,
		6: 4n,
		7: 1n
	}, 8), 9n);
});

test("signed multiply-long keeps register 31 as zero and preserves SP/NZCV", () => {
	const zeroInstruction = decodeAarch64Instruction(encode({
		accumulator: 31,
		destination: 4,
		secondSource: 2,
		source: 31
	}));
	const registers = createAarch64Registers({ stackPointer: 0x8000n });
	registers.nzcv = 0b1010;
	registers.write(2, 99n, 32);
	executeAarch64Data(zeroInstruction, registers);
	assert.equal(registers.read(4), 0n);
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
	assert.equal(registers.read(31), 0n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.nzcv, 0b1010);
});

test("neighboring unimplemented multiply encodings remain unknown", () => {
	for (const word of [0x9bc00000, 0x1b200000]) {
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
	executeAarch64Data(instruction, registers);
	return registers.read(destination, 64);
}

function encode(fields) {
	return (0x9b200000 + (fields.secondSource * 0x10000)
		+ (fields.subtract ? 0x8000 : 0) + (fields.accumulator * 0x400)
		+ (fields.source * 0x20) + fields.destination) >>> 0;
}

function selectShape(instruction) {
	const keys = ["accumulator", "destination", "family", "mnemonic",
		"secondSource", "source", "sourceWidth", "subtract", "width"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
