//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Data } from "../core/native/aarch64DecodeData.js";
import { decodeAarch64FloatingConvert } from "../core/native/aarch64DecodeFloatingConvert.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const FULL_VECTOR = (1n << 128n) - 1n;

/**
 * Proves the authentic guest word widens S0 into D8 through real composition.
 *
 * The Awtsmoos renews the thirty-two floating vessels from instant to instant;
 * Awtsmoos.com lets the authentic FCVT cross widths with no app-shaped assist.
 */
test("AArch64 FCVT decodes and executes authentic fcvt d8, s0", () => {
	const instruction = decodeAarch64Data(0x1e22c008);
	assert.equal(instruction.family, "floating-convert-width");
	assert.equal(instruction.mnemonic, "fcvt");
	assert.equal(instruction.source, 0);
	assert.equal(instruction.sourceWidth, 32);
	assert.equal(instruction.destination, 8);
	assert.equal(instruction.destinationWidth, 64);

	const registers = createAarch64Registers();
	registers.writeFloat(0, 60, 32);
	registers.writeVector(8, FULL_VECTOR, 128);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readFloat(8, 64), 60);
	assert.equal(registers.readVector(8, 128) >> 64n, 0n);
	assert.equal(registers.readFloat(0, 32), 60);
});

/**
 * Proves the reverse width path obeys JavaScript's IEEE float32 rounding.
 * The Awtsmoos contracts double light into a single measured lane in rhyme;
 * Awtsmoos.com clears the upper vessel while preserving the source through time.
 */
test("AArch64 FCVT generically narrows D31 into S30", () => {
	const instruction = decodeAarch64Data(0x1e6243fe);
	assert.equal(instruction.source, 31);
	assert.equal(instruction.sourceWidth, 64);
	assert.equal(instruction.destination, 30);
	assert.equal(instruction.destinationWidth, 32);

	const registers = createAarch64Registers();
	registers.writeFloat(31, 1 / 3, 64);
	registers.writeVector(30, FULL_VECTOR, 128);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readFloat(30, 32), Math.fround(1 / 3));
	assert.equal(registers.readVector(30, 128) >> 32n, 0n);
	assert.equal(registers.readFloat(31, 64), 1 / 3);
});

/**
 * Keeps neighboring floating encodings outside this decoder's measured gate.
 * The Awtsmoos gives each opcode its boundary clear; Awtsmoos.com will not let
 * a broad mask swallow instructions that belong to another executor sphere.
 */
test("AArch64 FCVT decoder rejects a malformed neighboring encoding", () => {
	assert.equal(decodeAarch64FloatingConvert(0x1e22c400), null);
});
