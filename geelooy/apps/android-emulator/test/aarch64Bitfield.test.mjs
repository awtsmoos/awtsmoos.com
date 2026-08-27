//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const OPERATION_CODES = Object.freeze({ bfm: 1, sbfm: 0, ubfm: 2 });

/**
 * Proves generic AArch64 bitfield behavior around the authentic Flutter word.
 * The Awtsmoos recreates extraction, insertion, sign, alias, and register shore
 * anew; Awtsmoos.com requires no external decoder and no word-specific shortcut.
 */
test("authentic UBFM word reveals and executes LSL W8 by six", () => {
	const instruction = decodeAarch64Instruction(0x531a6508, 9974796n);
	assert.equal(instruction.family, "bitfield-immediate");
	assert.equal(instruction.operation, "ubfm");
	assert.equal(instruction.mnemonic, "lsl");
	assert.equal(instruction.immr, 26);
	assert.equal(instruction.imms, 25);
	const registers = createAarch64Registers();
	registers.write(8, 0x01234567n, 32);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.read(8, 32), 0x48d159c0n);
});

test("UBFM extracts and inserts fields in W and X registers", () => {
	assert.equal(run("ubfm", 32, 4, 31, 0xf0000000n), 0x0f000000n);
	assert.equal(run("ubfm", 32, 8, 15, 0x0000ab00n), 0xabn);
	assert.equal(run("ubfm", 64, 56, 7, 0xabn), 0xab00n);
});

test("SBFM sign-extends extracting and inserting forms", () => {
	assert.equal(run("sbfm", 32, 4, 31, 0x80000000n), 0xf8000000n);
	assert.equal(run("sbfm", 32, 8, 15, 0x00008000n), 0xffffff80n);
	assert.equal(run("sbfm", 32, 24, 7, 0x80n), 0xffff8000n);
});

test("BFM preserves destination bits outside inserted fields", () => {
	assert.equal(run("bfm", 32, 8, 15, 0xab00n, 0x12345678n), 0x123456abn);
	assert.equal(run("bfm", 32, 24, 7, 0xabn, 0x12345678n), 0x1234ab78n);
});

test("zero registers and reserved encodings remain exact", () => {
	const sourceZero = decodeAarch64Instruction(encode("ubfm", 64, 56, 7, 31, 0));
	const registers = createAarch64Registers();
	registers.write(0, 0xffffn);
	executeAarch64Data(sourceZero, registers);
	assert.equal(registers.read(0), 0n);
	const destinationZero = decodeAarch64Instruction(encode("ubfm", 32, 0, 7, 0, 31));
	registers.write(0, 0xabn);
	executeAarch64Data(destinationZero, registers);
	assert.equal(registers.read(31), 0n);
	for (const word of [reservedOperation(), mismatchedN(), encode("ubfm", 32, 32, 7, 0, 0)]) {
		assert.equal(decodeAarch64Instruction(word).family, "unknown");
	}
});

function run(operation, width, immr, imms, source, destination = 0n) {
	const instruction = decodeAarch64Instruction(encode(operation, width, immr, imms, 1, 0));
	const registers = createAarch64Registers();
	registers.write(1, source, width);
	registers.write(0, destination, width);
	executeAarch64Data(instruction, registers);
	return registers.read(0, width);
}

function encode(operation, width, immr, imms, source, destination) {
	const sf = width === 64 ? 1 : 0;
	return ((sf * 0x80000000) + (OPERATION_CODES[operation] * 0x20000000)
		+ 0x13000000 + (sf * 0x00400000) + (immr * 0x00010000)
		+ (imms * 0x00000400) + (source * 0x20) + destination) >>> 0;
}

function reservedOperation() {
	return (0x13000000 + (3 * 0x20000000)) >>> 0;
}

function mismatchedN() {
	return (0x13000000 + 0x00400000 + (2 * 0x20000000)) >>> 0;
}
