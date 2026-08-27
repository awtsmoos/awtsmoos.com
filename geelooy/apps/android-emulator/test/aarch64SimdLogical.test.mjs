//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { decodeAarch64SimdLogical } from "../core/native/aarch64DecodeSimdLogical.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const ENCODINGS = Object.freeze([
	["and", 0x0e221c20, 0x4e251c83],
	["bic", 0x0e681ce6, 0x4e6b1d49],
	["orr", 0x0eae1dac, 0x4eb11e0f],
	["orn", 0x0ef41e72, 0x4ef71ed5],
	["eor", 0x2e3a1f38, 0x6e3d1f9b],
	["bsl", 0x2e621c20, 0x6e651c83],
	["bit", 0x2ea81ce6, 0x6eab1d49],
	["bif", 0x2eee1dac, 0x6ef11e0f]
]);

function executeWord(word, destination, source, secondSource) {
	const instruction = decodeAarch64Instruction(word);
	const registers = createAarch64Registers();
	registers.writeVector(instruction.destination, destination);
	registers.writeVector(instruction.source, source);
	registers.writeVector(instruction.secondSource, secondSource);
	assert.equal(executeAarch64Data(instruction, registers), true);
	return registers.readVector(instruction.destination);
}

/**
 * The Awtsmoos renews eight logical roads in both vector widths without disguise;
 * Awtsmoos.com proves authentic EOR and every mask-bearing sibling before our eyes.
 */
test("decodes all Advanced SIMD logical operations at both widths", () => {
	for (const [mnemonic, narrow, wide] of ENCODINGS) {
		assert.equal(decodeAarch64SimdLogical(narrow)?.mnemonic, mnemonic);
		assert.equal(decodeAarch64SimdLogical(narrow)?.width, 64);
		assert.equal(decodeAarch64SimdLogical(wide)?.mnemonic, mnemonic);
		assert.equal(decodeAarch64SimdLogical(wide)?.width, 128);
	}
	const authentic = decodeAarch64Instruction(0x6e211c21, 0x10032d9a8n);
	assert.deepEqual(
		[authentic.family, authentic.mnemonic, authentic.width],
		["simd-logical", "eor", 128]
	);
	assert.deepEqual(
		[authentic.destination, authentic.source, authentic.secondSource],
		[1, 1, 1]
	);
	assert.equal(decodeAarch64SimdLogical(0x0e201800), null);
});

test("executes pure logical operations with exact active-width masking", () => {
	assert.equal(executeWord(0x0e221c20, 0n, 0xccn, 0xaan), 0x88n);
	assert.equal(executeWord(0x0e681ce6, 0n, 0xccn, 0xaan), 0x44n);
	assert.equal(executeWord(0x0eae1dac, 0n, 0xccn, 0xaan), 0xeen);
	assert.equal(
		executeWord(0x0ef41e72, 0n, 0xccn, 0xaan),
		0xffffffffffffffddn
	);
	assert.equal(executeWord(0x2e3a1f38, 0n, 0xccn, 0xaan), 0x66n);
});

test("BSL BIT and BIF preserve old-destination mask semantics", () => {
	assert.equal(executeWord(0x2e621c20, 0xf0n, 0xccn, 0xaan), 0xcan);
	assert.equal(executeWord(0x2ea81ce6, 0xf0n, 0xccn, 0xaan), 0xd8n);
	assert.equal(executeWord(0x2eee1dac, 0xf0n, 0xccn, 0xaan), 0xe4n);
});

test("authentic EOR self-alias zeros 128 bits and Q=0 clears upper half", () => {
	const registers = createAarch64Registers();
	const authentic = decodeAarch64Instruction(0x6e211c21);
	registers.writeVector(1, (1n << 127n) | 0x1234n);
	assert.equal(executeAarch64Data(authentic, registers), true);
	assert.equal(registers.readVector(1), 0n);
	registers.writeVector(0, (1n << 120n) | 0x55n);
	registers.writeVector(1, 0xffffffffffffffffn);
	registers.writeVector(2, 0x0f0f0f0f0f0f0f0fn);
	const narrow = decodeAarch64Instruction(0x0e221c20);
	assert.equal(executeAarch64Data(narrow, registers), true);
	assert.equal(registers.readVector(0), 0x0f0f0f0f0f0f0f0fn);
});
