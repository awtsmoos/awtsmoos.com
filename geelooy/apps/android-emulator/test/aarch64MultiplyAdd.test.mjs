//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves ordinary MADD/MSUB at W and X widths around Flutter's authentic word.
 */
test("authentic MADD X9, X20, X8, X0 decodes and executes", () => {
	const instruction = decodeAarch64Instruction(0x9b080289, 0x4908c0n);
	assert.deepEqual(shape(instruction), {
		accumulator: 0,
		destination: 9,
		family: "multiply-add",
		mnemonic: "madd",
		secondSource: 8,
		source: 20,
		subtract: false,
		width: 64
	});
	assert.equal(run(instruction, { 0: 0x700000000010n, 8: 24n, 20: 0n }, 9),
		0x700000000010n);
});

test("MADD and MSUB wrap correctly at W and X widths", () => {
	assert.equal(runWord(encode(32, false, 1, 2, 3, 4), {
		1: 0xffffffffn, 2: 2n, 3: 3n
	}, 4), 1n);
	assert.equal(runWord(encode(64, true, 1, 2, 3, 4), {
		1: 5n, 2: 7n, 3: 2n
	}, 4), BigInt.asUintN(64, -33n));
	assert.equal(runWord(encode(64, false, 1, 2, 3, 4), {
		1: 0xffffffffffffffffn, 2: 2n, 3: 3n
	}, 4), 1n);
});

test("register 31 is zero for sources, accumulator, and destination", () => {
	assert.equal(runWord(encode(64, false, 31, 2, 31, 4), { 2: 99n }, 4), 0n);
	const registers = createAarch64Registers({ stackPointer: 0x8000n });
	registers.nzcv = 0b1010;
	registers.write(1, 2n);
	registers.write(2, 3n);
	registers.write(3, 4n);
	const discarded = decodeAarch64Instruction(encode(64, false, 1, 2, 3, 31));
	assert.equal(executeAarch64Data(discarded, registers), true);
	assert.equal(registers.read(31), 0n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.nzcv, 0b1010);
});

test("widening and neighboring high multiply families keep their boundaries", () => {
	assert.equal(decodeAarch64Instruction(0x9b332500).family,
		"signed-multiply-add-long");
	assert.equal(decodeAarch64Instruction(0x9ba97d18).family,
		"unsigned-multiply-add-long");
	assert.equal(decodeAarch64Instruction(0x9bc00000).family, "unknown");
});

function runWord(word, values, destination) {
	return run(decodeAarch64Instruction(word), values, destination);
}

function run(instruction, values, destination) {
	const registers = createAarch64Registers();
	for (const [index, value] of Object.entries(values)) {
		registers.write(Number(index), value, instruction.width);
	}
	assert.equal(executeAarch64Data(instruction, registers), true);
	return registers.read(destination, instruction.width);
}

function encode(width, subtract, source, secondSource, accumulator, destination) {
	return (0x1b000000 + (width === 64 ? 0x80000000 : 0)
		+ (secondSource * 0x10000) + (subtract ? 0x8000 : 0)
		+ (accumulator * 0x400) + (source * 0x20) + destination) >>> 0;
}

function shape(instruction) {
	const keys = ["accumulator", "destination", "family", "mnemonic",
		"secondSource", "source", "subtract", "width"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
