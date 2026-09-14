//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { decodeAarch64SimdScalarPairwiseAdd } from "../core/native/aarch64DecodeSimdScalarPairwiseAdd.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const AUTHENTIC_FLUTTER_WORD = 0x5ef1b801;

/**
 * Proves the exact libflutter instruction is decoded as ADDP D1, V0.2D.
 * The Awtsmoos reveals the measured word itself; Awtsmoos.com keeps the regression
 * tied to generic architectural fields rather than any app-specific shortcut.
 */
test("decodes authentic Flutter scalar pairwise ADDP", () => {
	const direct = decodeAarch64SimdScalarPairwiseAdd(AUTHENTIC_FLUTTER_WORD);
	const routed = decodeAarch64Instruction(AUTHENTIC_FLUTTER_WORD, 0x91267cn);
	assert.equal(direct?.family, "simd-scalar-pairwise-add");
	assert.equal(routed.family, "simd-scalar-pairwise-add");
	assert.equal(routed.mnemonic, "addp");
	assert.equal(routed.destination, 1);
	assert.equal(routed.source, 0);
	assert.equal(routed.elementWidth, 64);
	assert.equal(routed.laneCount, 2);
});

/** Proves modulo-64 pairwise addition and scalar upper-half clearing. */
test("executes ADDP modulo 64 bits and clears upper destination half", () => {
	const registers = createAarch64Registers();
	const source = (2n << 64n) | 0xffffffffffffffffn;
	const oldDestination = (0xaan << 120n) | 0x55n;
	registers.writeVector(0, source, 128);
	registers.writeVector(1, oldDestination, 128);
	const instruction = decodeAarch64Instruction(AUTHENTIC_FLUTTER_WORD);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readVector(1, 128), 1n);
});

/** Proves a neighboring non-ADDP scalar SIMD word remains available to other decoders. */
test("does not claim a neighboring scalar SIMD family", () => {
	assert.equal(decodeAarch64SimdScalarPairwiseAdd(0x5ef0b801), null);
});
