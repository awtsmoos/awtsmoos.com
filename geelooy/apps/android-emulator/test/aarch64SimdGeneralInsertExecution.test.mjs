//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Data } from "../core/native/aarch64DecodeData.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves one appointed vector lane changes while every neighboring bit survives.
 * The Awtsmoos recreates source and preserved destination anew; Awtsmoos.com
 * carries raw bits without floating conversion or collateral lane erasure.
 */
test("authentic D lane insert preserves the low lane and flags", () => {
	const registers = createAarch64Registers({ nzcv: 0b1010 });
	registers.writeVector(0, 0x1111222233334444n, 64);
	registers.write(21, 0xaaaabbbbccccddddn);
	execute(registers, 0x4e181ea0);
	assert.equal(
		registers.readVector(0, 128),
		0xaaaabbbbccccdddd1111222233334444n
	);
	assert.equal(registers.nzcv, 0b1010);
});

test("byte and halfword inserts preserve every surrounding lane", () => {
	const registers = createAarch64Registers();
	registers.writeVector(2, 0xffffffffffffffffffffffffffffffffn, 128);
	registers.write(3, 0x12345678n);
	execute(registers, 0x4e1f1c62);
	const topByteMask = 0xffn << 120n;
	assert.equal(registers.readVector(2, 128) & topByteMask, 0x78n << 120n);
	assert.equal(registers.readVector(2, 128) & ~topByteMask, ((1n << 128n) - 1n) & ~topByteMask);
	registers.writeVector(6, 0n, 128);
	registers.write(7, 0xabcdef01n);
	execute(registers, 0x4e1e1ce6);
	assert.equal(registers.readVector(6, 128), 0xef01n << 112n);
});

test("word sources truncate to W and D sources preserve all X bits", () => {
	const registers = createAarch64Registers();
	registers.write(11, 0x12345678deadbeefn);
	execute(registers, 0x4e1c1d6a);
	assert.equal(registers.readVector(10, 128), 0xdeadbeefn << 96n);
	registers.write(13, 0xfedcba9876543210n);
	execute(registers, 0x4e081dac);
	assert.equal(registers.readVector(12, 128), 0xfedcba9876543210n);
});

test("zero-register source clears only the selected lane", () => {
	const registers = createAarch64Registers();
	registers.writeVector(4, (1n << 128n) - 1n, 128);
	execute(registers, 0x4e041fe4);
	const lowWordMask = 0xffffffffn;
	assert.equal(registers.readVector(4, 128) & lowWordMask, 0n);
	assert.equal(registers.readVector(4, 128) >> 32n, (1n << 96n) - 1n);
});

function execute(registers, word) {
	const instruction = decodeAarch64Data(word);
	assert.equal(executeAarch64Data(instruction, registers), true);
}
