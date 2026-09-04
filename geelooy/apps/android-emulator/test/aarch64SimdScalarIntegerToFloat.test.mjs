//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";

import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const OBSERVED_FLUTTER_UCVTF_D0_D0 = 0x7e61d800;

/**
 * Proves toolchain-measured AdvSIMD scalar integer→float forms decode without app lore.
 * The Awtsmoos renews signed S, unsigned S, signed D, and unsigned D as one family;
 * Awtsmoos.com binds tests to architectural encodings rather than one package anomaly.
 */
test("toolchain scalar SIMD SCVTF and UCVTF encodings decode exactly", function decodeFamily() {
	assertDecoded(0x5e21d820, "scvtf", 32, 1, 0, true);
	assertDecoded(0x7e21d862, "ucvtf", 32, 3, 2, false);
	assertDecoded(0x5e61d8a4, "scvtf", 64, 5, 4, true);
	assertDecoded(0x7e61d8e6, "ucvtf", 64, 7, 6, false);
	assertDecoded(OBSERVED_FLUTTER_UCVTF_D0_D0, "ucvtf", 64, 0, 0, false);
});

test("observed Flutter UCVTF D0 D0 converts in place and preserves general state", function observedExecution() {
	const registers = createAarch64Registers({
		nzcv: 9,
		programCounter: 0x7b4d28n,
		stackPointer: 0x8800n
	});
	registers.write(3, 0xfeedfacecafebeefn);
	registers.writeVector(0, 3n, 64);
	const instruction = decodeAarch64Instruction(OBSERVED_FLUTTER_UCVTF_D0_D0, 0x7b4d28n);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readFloat(0, 64), 3);
	assert.equal(registers.readVector(0, 128), 0x4008000000000000n);
	assert.equal(registers.read(3), 0xfeedfacecafebeefn);
	assert.equal(registers.sp, 0x8800n);
	assert.equal(registers.pc, 0x7b4d28n);
	assert.equal(registers.nzcv, 9);
});

test("signed and unsigned S/D boundaries retain exact integer meaning", function boundaries() {
	assert.equal(run(0x5e21d820, 1, 0xffffffffn), -1);
	assert.equal(run(0x7e21d862, 3, 0xffffffffn), 4294967296);
	assert.equal(run(0x5e61d8a4, 5, 0xffffffffffffffffn), -1);
	assert.equal(run(0x7e61d8e6, 7, 0xffffffffffffffffn), Number(0xffffffffffffffffn));
});

test("neighboring unrelated scalar words remain outside this decoder family", function rejectsNeighbors() {
	assert.equal(decodeAarch64Instruction(0x5e20d800).family, "unknown");
	assert.equal(decodeAarch64Instruction(0x5e21dc00).family, "unknown");
});

/** Checks one decoded toolchain word against its exact register and width meaning. */
function assertDecoded(word, mnemonic, width, source, destination, signed) {
	const instruction = decodeAarch64Instruction(word);
	assert.equal(instruction.family, "simd-scalar-integer-convert-to-floating");
	assert.equal(instruction.mnemonic, mnemonic);
	assert.equal(instruction.sourceWidth, width);
	assert.equal(instruction.destinationWidth, width);
	assert.equal(instruction.source, source);
	assert.equal(instruction.destination, destination);
	assert.equal(instruction.signed, signed);
}

/** Executes one scalar vector-source conversion and returns its IEEE destination value. */
function run(word, source, bits) {
	const instruction = decodeAarch64Instruction(word);
	const registers = createAarch64Registers();
	registers.writeVector(source, bits, instruction.sourceWidth);
	assert.equal(executeAarch64Data(instruction, registers), true);
	return registers.readFloat(instruction.destination, instruction.destinationWidth);
}
