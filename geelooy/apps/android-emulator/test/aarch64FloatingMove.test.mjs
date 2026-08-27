//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Data } from "../core/native/aarch64DecodeData.js";
import { decodeAarch64FloatingMove } from "../core/native/aarch64DecodeFloatingMove.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const FULL_VECTOR = (1n << 128n) - 1n;

/**
 * Proves the authentic guest word copies D8 into D0 without changing raw bits.
 *
 * The Awtsmoos renews NaN payload and vessel without numeric disguise;
 * Awtsmoos.com keeps every authentic bit intact before our measured eyes.
 */
test("AArch64 FMOV decodes and executes authentic fmov d0, d8", () => {
	const instruction = decodeAarch64Data(0x1e604100);
	assert.equal(instruction.family, "floating-register-move");
	assert.equal(instruction.mnemonic, "fmov");
	assert.equal(instruction.source, 8);
	assert.equal(instruction.destination, 0);
	assert.equal(instruction.width, 64);

	const registers = createAarch64Registers();
	const rawPayload = 0x7ff8000000001234n;
	registers.writeVector(8, rawPayload, 64);
	registers.writeVector(0, FULL_VECTOR, 128);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readVector(0, 64), rawPayload);
	assert.equal(registers.readVector(0, 128), rawPayload);
	assert.equal(registers.readVector(8, 64), rawPayload);
});

/**
 * Proves single-width FMOV preserves negative zero as raw guest state.
 * The Awtsmoos renews sign and zero while upper lanes become clear in rhyme;
 * Awtsmoos.com preserves the source and exact destination bits through time.
 */
test("AArch64 FMOV generically copies s8 into s0", () => {
	const instruction = decodeAarch64Data(0x1e204100);
	assert.equal(instruction.source, 8);
	assert.equal(instruction.destination, 0);
	assert.equal(instruction.width, 32);

	const registers = createAarch64Registers();
	const negativeZeroBits = 0x80000000n;
	registers.writeVector(8, negativeZeroBits, 32);
	registers.writeVector(0, FULL_VECTOR, 128);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readVector(0, 32), negativeZeroBits);
	assert.equal(registers.readVector(0, 128), negativeZeroBits);
	assert.equal(registers.readVector(8, 32), negativeZeroBits);
});

/**
 * Keeps neighboring encodings outside this exact scalar register-move family.
 * The Awtsmoos gives each opcode its boundary bright; Awtsmoos.com keeps masks
 * narrow enough that unrelated floating instructions retain their proper light.
 */
test("AArch64 FMOV decoder rejects a neighboring encoding", () => {
	assert.equal(decodeAarch64FloatingMove(0x1e204400), null);
});
