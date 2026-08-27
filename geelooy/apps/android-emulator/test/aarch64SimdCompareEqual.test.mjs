//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves AdvSIMD CMEQ decoding and all-ones equality masks across arrangements.
 * The Awtsmoos renews authentic bytes, aliasing, V31, and preserved shore;
 * Awtsmoos.com admits no reserved neighbor into this measured family evermore.
 */
test("authentic CMEQ V0.16B, V0.16B, V1.16B decodes and executes", () => {
	const instruction = decodeAarch64Instruction(0x6e218c00, 8809556n);
	assert.deepEqual(shape(instruction), {
		destination: 0,
		elementWidth: 8,
		family: "simd-compare-equal",
		laneCount: 16,
		mnemonic: "cmeq",
		secondSource: 1,
		source: 0,
		width: 128
	});
	const left = pack([45, 65, 45, 66, 45, 67, 45, 68, 45, 69, 45, 70, 45, 71, 45, 72], 8);
	const right = pack(new Array(16).fill(45), 8);
	assert.equal(run(0x6e218c00, 0, left, 1, right, 0), pack([
		255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0
	], 8));
});

test("CMEQ covers every valid lane arrangement", () => {
	for (const sample of [
		{ word: encode(0, 0, 2, 1, 3), width: 8, lanes: [1, 2, 3, 4, 5, 6, 7, 8] },
		{ word: encode(1, 1, 2, 1, 3), width: 16, lanes: [1, 2, 3, 4, 5, 6, 7, 8] },
		{ word: encode(1, 2, 2, 1, 3), width: 32, lanes: [1, 2, 3, 4] },
		{ word: encode(1, 3, 2, 1, 3), width: 64, lanes: [1, 2] }
	]) {
		const right = sample.lanes.map((value, index) => index === 1 ? value + 1 : value);
		const result = run(sample.word, 1, pack(sample.lanes, sample.width), 2,
			pack(right, sample.width), 3);
		const expected = sample.lanes.map((value, index) => index === 1
			? 0n
			: (1n << BigInt(sample.width)) - 1n);
		assert.equal(result, pack(expected, sample.width));
	}
});

test("aliasing, V31, and scalar state remain exact", () => {
	const registers = createAarch64Registers({ nzcv: 9, stackPointer: 0x8000n });
	registers.write(8, 0x1234n);
	registers.writeVector(31, pack([1, 2, 3, 4, 5, 6, 7, 8], 8), 64);
	registers.writeVector(2, pack([1, 9, 3, 9, 5, 9, 7, 9], 8), 64);
	const instruction = decodeAarch64Instruction(encode(0, 0, 2, 31, 31));
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readVector(31, 64), pack([255, 0, 255, 0, 255, 0, 255, 0], 8));
	assert.equal(registers.read(8), 0x1234n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.nzcv, 9);
});

test("reserved and neighboring encodings remain outside CMEQ", () => {
	for (const word of [encode(0, 3, 1, 0, 0), 0x4e218c00, 0x6e218400, 0]) {
		assert.notEqual(decodeAarch64Instruction(word).family, "simd-compare-equal");
	}
});

function run(word, leftRegister, left, rightRegister, right, destination) {
	const registers = createAarch64Registers();
	registers.writeVector(leftRegister, left, 128);
	registers.writeVector(rightRegister, right, 128);
	const instruction = decodeAarch64Instruction(word);
	executeAarch64Data(instruction, registers);
	return registers.readVector(destination, instruction.width);
}

function encode(q, size, secondSource, source, destination) {
	return (0x2e208c00 | (q << 30) | (size << 22)
		| (secondSource << 16) | (source << 5) | destination) >>> 0;
}

function pack(values, width) {
	return values.reduce((result, value, index) => {
		return result | (BigInt(value) << BigInt(index * width));
	}, 0n);
}

function shape(instruction) {
	const keys = ["destination", "elementWidth", "family", "laneCount",
		"mnemonic", "secondSource", "source", "width"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
