//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

test("authentic DUP V0.2D, X22 decodes and executes", () => {
	const instruction = decodeAarch64Instruction(0x4e080ec0, 4713108n);
	assert.equal(instruction.family, "simd-general-duplicate");
	assert.equal(instruction.elementWidth, 64);
	assert.equal(instruction.laneCount, 2);
	assert.equal(instruction.source, 22);
	const registers = createAarch64Registers({ nzcv: 8, stackPointer: 0x8800n });
	registers.write(22, 4n);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readVector(0, 128), 4n | (4n << 64n));
	assert.equal(registers.read(22), 4n);
	assert.equal(registers.sp, 0x8800n);
	assert.equal(registers.nzcv, 8);
});

test("DUP covers every valid element and vector width", () => {
	for (const sample of [
		[encode(0, 1, 2, 3), 8, 8],
		[encode(1, 1, 2, 3), 8, 16],
		[encode(0, 2, 2, 3), 16, 4],
		[encode(1, 2, 2, 3), 16, 8],
		[encode(0, 4, 2, 3), 32, 2],
		[encode(1, 4, 2, 3), 32, 4],
		[encode(1, 8, 2, 3), 64, 2]
	]) {
		const [word, elementWidth, laneCount] = sample;
		const instruction = decodeAarch64Instruction(word);
		assert.deepEqual([instruction.elementWidth, instruction.laneCount], [elementWidth, laneCount]);
	}
});

test("DUP from WZR/XZR produces a zero vector", () => {
	for (const word of [encode(1, 1, 31, 4), encode(1, 8, 31, 5)]) {
		const registers = createAarch64Registers();
		const instruction = decodeAarch64Instruction(word);
		executeAarch64Data(instruction, registers);
		assert.equal(registers.readVector(instruction.destination, instruction.width), 0n);
	}
});

test("reserved and neighboring copy encodings remain separate", () => {
	for (const word of [0x0e000c00, encode(0, 8, 1, 0), 0x4e001c00, 0x4e083c00]) {
		assert.notEqual(decodeAarch64Instruction(word).family, "simd-general-duplicate");
	}
});

function encode(q, immediate, source, destination) {
	return (0x0e000c00 | (q << 30) | (immediate << 16)
		| (source << 5) | destination) >>> 0;
}
