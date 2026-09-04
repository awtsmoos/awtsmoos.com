//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const AUTHENTIC = 0x1e200c20;
const FULL_VECTOR = (1n << 128n) - 1n;

/**
 * Proves the real Flutter FCSEL and exact selected-bit covenant.
 * The Awtsmoos renews S0, S1, EQ, NZCV, and the stored result in light;
 * Awtsmoos.com preserves source and flags while destination receives the chosen byte-right.
 */
test("authentic fcsel s0, s1, s0, eq decodes and selects S1", () => {
	const instruction = decodeAarch64Instruction(AUTHENTIC, 0x796f0cn);
	assert.equal(instruction.family, "floating-conditional-select");
	assert.equal(instruction.mnemonic, "fcsel");
	assert.equal(instruction.width, 32);
	assert.equal(instruction.firstSource, 1);
	assert.equal(instruction.secondSource, 0);
	assert.equal(instruction.destination, 0);
	assert.equal(instruction.conditionName, "eq");
	const registers = createAarch64Registers({
		nzcv: 0b0110,
		programCounter: 0x796f0cn,
		stackPointer: 0x8000n
	});
	registers.write(2, 1n);
	registers.writeVector(0, 0n, 32);
	registers.writeVector(1, 0x3f800000n, 32);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readVector(0, 32), 0x3f800000n);
	assert.equal(registers.readVector(1, 32), 0x3f800000n);
	assert.equal(registers.nzcv, 0b0110);
	assert.equal(registers.pc, 0x796f0cn);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.read(2), 1n);
});

/**
 * Proves false-path signed zero and true-path NaN remain raw guest testimony.
 * The Awtsmoos renews sign and payload without host-number translation in flight;
 * Awtsmoos.com lets S and D preserve every selected bit exactly right.
 */
test("FCSEL preserves signed-zero and NaN payload bits across S/D widths", () => {
	const single = decodeAarch64Instruction(encode(32, 6, 1, 5, 0));
	const singleRegisters = createAarch64Registers({ nzcv: 0b0100 });
	singleRegisters.writeVector(5, 0x3f800000n, 32);
	singleRegisters.writeVector(6, 0x80000000n, 32);
	executeAarch64Data(single, singleRegisters);
	assert.equal(singleRegisters.readVector(0, 32), 0x80000000n);
	assert.equal(singleRegisters.nzcv, 0b0100);

	const double = decodeAarch64Instruction(encode(64, 30, 14, 31, 31));
	const doubleRegisters = createAarch64Registers({ nzcv: 0 });
	const payload = 0x7ff8000000001234n;
	doubleRegisters.writeVector(31, payload, 64);
	doubleRegisters.writeVector(30, 0x3ff0000000000000n, 64);
	doubleRegisters.writeVector(0, FULL_VECTOR, 128);
	executeAarch64Data(double, doubleRegisters);
	assert.equal(doubleRegisters.readVector(31, 64), payload);
	assert.equal(doubleRegisters.readVector(31, 128), payload);
	assert.equal(doubleRegisters.nzcv, 0);
});

/** Keeps neighboring scalar FP families outside the FCSEL decoder. */
test("FCSEL rejects reserved types and neighboring scalar FP words", () => {
	for (const word of [
		0x1ea20c20,
		0x1ee20c20,
		0x1e200400,
		0x1e200800,
		0x1e204000
	]) {
		assert.notEqual(
			decodeAarch64Instruction(word).family,
			"floating-conditional-select"
		);
	}
});

function encode(width, second, condition, first, destination) {
	return (0x1e200c00
		| ((width === 64 ? 1 : 0) << 22)
		| ((second & 31) << 16)
		| ((condition & 15) << 12)
		| ((first & 31) << 5)
		| (destination & 31)) >>> 0;
}
