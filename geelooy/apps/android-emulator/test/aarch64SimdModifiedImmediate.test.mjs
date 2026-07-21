//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { expandByteMaskImmediate } from "../core/native/aarch64DecodeSimdModifiedImmediate.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves every MOVI D/2D byte-mask immediate with authentic toolchain words.
 * The Awtsmoos recreates all 256 byte constellations and both lane vessels anew;
 * Awtsmoos.com tests the entire measured class rather than one convenient zero.
 */
test("authentic MOVI V0.2D zero decodes and clears the full vector", () => {
	const instruction = decodeAarch64Instruction(0x6f00e400, 10030856n);
	assert.equal(instruction.family, "simd-modified-immediate");
	assert.equal(instruction.mnemonic, "movi");
	assert.equal(instruction.arrangement, "2d");
	assert.equal(instruction.immediate, 0);
	const registers = createAarch64Registers();
	registers.writeVector(0, (1n << 128n) - 1n, 128);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readVector(0, 128), 0n);
});

test("five local toolchain encodings preserve exact lane evidence", () => {
	const cases = [
		[0x6f00e400, 0, "2d", 0x0000000000000000n],
		[0x6f07e7e1, 1, "2d", 0xffffffffffffffffn],
		[0x6f02e6a2, 2, "2d", 0x00ff00ff00ff00ffn],
		[0x2f00e403, 3, "d", 0x0000000000000000n],
		[0x2f05e544, 4, "d", 0xff00ff00ff00ff00n]
	];
	for (const [word, destination, arrangement, lane] of cases) {
		const decoded = decodeAarch64Instruction(word);
		assert.equal(decoded.destination, destination);
		assert.equal(decoded.arrangement, arrangement);
		assert.equal(BigInt(decoded.lane), lane);
	}
});

test("all 256 immediates execute in D and 2D arrangements", () => {
	for (let immediate = 0; immediate < 256; immediate += 1) {
		const lane = expandByteMaskImmediate(immediate);
		for (const qBit of [0, 1]) {
			const registers = createAarch64Registers();
			registers.writeVector(31, (1n << 128n) - 1n, 128);
			const instruction = decodeAarch64Instruction(encode(qBit, immediate, 31));
			executeAarch64Data(instruction, registers);
			const expected = qBit === 1 ? lane | (lane << 64n) : lane;
			assert.equal(registers.readVector(31, 128), expected);
		}
	}
});

test("MOVI changes only its vector destination and preserves NZCV and X state", () => {
	const registers = createAarch64Registers();
	registers.write(0, 0x1122334455667788n);
	registers.writeVector(1, 0x1234n, 128);
	registers.nzcv = 0b1010;
	const instruction = decodeAarch64Instruction(encode(1, 0xaa, 2));
	executeAarch64Data(instruction, registers);
	assert.equal(registers.read(0), 0x1122334455667788n);
	assert.equal(registers.readVector(1, 128), 0x1234n);
	assert.equal(registers.nzcv, 0b1010);
});

test("neighboring modified-immediate classes remain unknown", () => {
	for (const word of [0x4f00e400, 0x6f00f400, 0x6f00ec00]) {
		assert.equal(decodeAarch64Instruction(word).family, "unknown");
	}
});

function encode(qBit, immediate, destination) {
	const high = (immediate >>> 5) & 0x7;
	const low = immediate & 0x1f;
	return (0x2f00e400 + (qBit * 0x40000000)
		+ (high * 0x10000) + (low * 0x20) + destination) >>> 0;
}
