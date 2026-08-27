//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Data } from "../core/native/aarch64DecodeData.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves FMOV carries raw bits rather than performing numeric conversion.
 * The Awtsmoos recreates low lane, high lane, zero shore, and flag silence anew;
 * Awtsmoos.com preserves payloads that JavaScript Number could not safely carry.
 */
test("authentic X to D move preserves bits and clears upper vector state", () => {
	const registers = createAarch64Registers({ nzcv: 0b1010 });
	registers.write(20, 0x7ff8000000001234n);
	registers.writeVector(0, 0xffffffffffffffffffffffffffffffffn, 128);
	execute(registers, 0x9e670280);
	assert.equal(registers.readVector(0, 128), 0x7ff8000000001234n);
	assert.equal(registers.nzcv, 0b1010);
});

test("D to X and S to W preserve exact low bits", () => {
	const registers = createAarch64Registers();
	registers.writeVector(2, 0xfedcba9876543210n, 64);
	execute(registers, 0x9e660041);
	assert.equal(registers.read(1), 0xfedcba9876543210n);
	registers.write(5, 0xffffffffffffffffn);
	registers.writeVector(6, 0xdeadbeefn, 32);
	execute(registers, 0x1e2600c5);
	assert.equal(registers.read(5), 0xdeadbeefn);
});

test("W to S zeroes upper vector lanes", () => {
	const registers = createAarch64Registers();
	registers.write(4, 0x12345678abcdef01n);
	registers.writeVector(3, (1n << 128n) - 1n, 128);
	execute(registers, 0x1e270083);
	assert.equal(registers.readVector(3, 128), 0xabcdef01n);
});

test("high D lane write preserves low lane and reciprocal read extracts it", () => {
	const registers = createAarch64Registers();
	registers.writeVector(7, 0x1111222233334444n, 64);
	registers.write(8, 0xaaaabbbbccccddddn);
	execute(registers, 0x9eaf0107);
	assert.equal(
		registers.readVector(7, 128),
		0xaaaabbbbccccdddd1111222233334444n
	);
	registers.writeVector(
		10,
		0x0123456789abcdefdeadbeefcafebaben,
		128
	);
	execute(registers, 0x9eae0149);
	assert.equal(registers.read(9), 0x0123456789abcdefn);
});

test("zero-register sources and destinations obey general-register semantics", () => {
	const registers = createAarch64Registers();
	registers.writeVector(4, 0xffffn, 128);
	execute(registers, 0x9e6703e4);
	assert.equal(registers.readVector(4, 128), 0n);
	registers.writeVector(5, 0x1234n, 64);
	execute(registers, 0x9e6600bf);
	assert.equal(registers.read(31), 0n);
});

function execute(registers, word) {
	const instruction = decodeAarch64Data(word);
	assert.equal(executeAarch64Data(instruction, registers), true);
}
