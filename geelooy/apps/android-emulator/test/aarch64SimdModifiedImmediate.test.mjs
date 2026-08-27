//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { expandByteMaskImmediate } from "../core/native/aarch64DecodeSimdModifiedImmediate.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

test("authentic MOVI V0.2S, #1, LSL #24 decodes and executes", () => {
	const instruction = decodeAarch64Instruction(0x0f006420, 4784352n);
	assert.deepEqual(shape(instruction), {
		arrangement: "2s",
		cmode: 6,
		destination: 0,
		elementWidth: 32,
		family: "simd-modified-immediate",
		immediate: 1,
		lane: "16777216",
		laneCount: 2,
		mnemonic: "movi",
		operation: "replace",
		shift: 24,
		shiftMode: "lsl",
		width: 64
	});
	const registers = createAarch64Registers({ nzcv: 10, stackPointer: 0x8000n });
	registers.write(8, 0x1234n);
	registers.writeVector(0, (1n << 128n) - 1n, 128);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readVector(0, 128), 0x0100000001000000n);
	assert.equal(registers.read(8), 0x1234n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.nzcv, 10);
});

test("all 256 D and 2D byte-mask immediates remain exact", () => {
	for (let immediate = 0; immediate < 256; immediate += 1) {
		const lane = expandByteMaskImmediate(immediate);
		for (const qBit of [0, 1]) {
			const registers = createAarch64Registers();
			registers.writeVector(31, (1n << 128n) - 1n, 128);
			const instruction = decodeAarch64Instruction(
				encode(qBit, 1, 14, immediate, 31)
			);
			executeAarch64Data(instruction, registers);
			const expected = qBit === 1 ? lane | (lane << 64n) : lane;
			assert.equal(registers.readVector(31, 128), expected);
		}
	}
});

test("byte MOVI replicates imm8 and Q controls upper silence", () => {
	const low = run(0x0f00e640, 0, (1n << 128n) - 1n);
	const full = run(0x4f00e641, 1, 0n);
	assert.equal(low, 0x1212121212121212n);
	assert.equal(full, 0x12121212121212121212121212121212n);
});

function run(word, destination, initial) {
	const registers = createAarch64Registers();
	registers.writeVector(destination, initial, 128);
	const instruction = decodeAarch64Instruction(word);
	executeAarch64Data(instruction, registers);
	return registers.readVector(destination, 128);
}

function encode(qBit, op, cmode, immediate, destination) {
	return (0x0f000400 | (qBit << 30) | (op << 29) | (cmode << 12)
		| (((immediate >>> 5) & 7) << 16) | ((immediate & 31) << 5)
		| destination) >>> 0;
}

function shape(instruction) {
	const keys = ["arrangement", "cmode", "destination", "elementWidth",
		"family", "immediate", "lane", "laneCount", "mnemonic", "operation",
		"shift", "shiftMode", "width"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
