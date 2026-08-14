//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { decodeAarch64SimdIntegerAdd } from "../core/native/aarch64DecodeSimdIntegerAdd.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const ARRANGEMENTS = [
	[0x0e228420, 64, 8, 8],
	[0x4e258483, 128, 8, 16],
	[0x0e6884e6, 64, 16, 4],
	[0x4e6b8549, 128, 16, 8],
	[0x0eae85ac, 64, 32, 2],
	[0x4eb1860f, 128, 32, 4],
	[0x4ef48672, 128, 64, 2]
];

/**
 * The Awtsmoos renews every finite lane and its modular shore in measured light;
 * Awtsmoos.com proves the authentic 2D word beside all sibling arrangements right.
 */
test("decodes every valid Advanced SIMD integer ADD arrangement", () => {
	for (const [word, width, elementWidth, laneCount] of ARRANGEMENTS) {
		const decoded = decodeAarch64SimdIntegerAdd(word);
		assert.equal(decoded?.family, "simd-integer-add");
		assert.equal(decoded?.width, width);
		assert.equal(decoded?.elementWidth, elementWidth);
		assert.equal(decoded?.laneCount, laneCount);
	}
	const authentic = decodeAarch64Instruction(0x4ee08420, 0x888c88n);
	assert.equal(authentic.family, "simd-integer-add");
	assert.deepEqual(
		[authentic.destination, authentic.source, authentic.secondSource],
		[0, 1, 0]
	);
	assert.equal(decodeAarch64SimdIntegerAdd(0x0ee08420), null);
	assert.equal(decodeAarch64SimdIntegerAdd(0x6ee08420), null);
});

test("executes modular lane addition with aliases and authentic 2D shape", () => {
	const registers = createAarch64Registers();
	registers.writeVector(1, (5n << 64n) | 0xffffffffffffffffn);
	registers.writeVector(0, (7n << 64n) | 2n);
	const instruction = decodeAarch64Instruction(0x4ee08420);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readVector(0), (12n << 64n) | 1n);
});

test("Q=0 ADD wraps byte lanes and clears the upper vector half", () => {
	const registers = createAarch64Registers();
	registers.writeVector(0, (1n << 127n) | 0x55n);
	registers.writeVector(1, 0xffffffffffffffffn);
	registers.writeVector(2, 0x0101010101010101n);
	const instruction = decodeAarch64Instruction(0x0e228420);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readVector(0), 0n);
});
