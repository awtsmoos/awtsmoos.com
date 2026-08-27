//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { evaluateAarch64Condition } from "../core/native/aarch64Condition.js";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const FORMS = Object.freeze([
	[0x1e202040, "fcmp", 32, false],
	[0x1e642060, "fcmp", 64, false],
	[0x1e2020a8, "fcmp", 32, true],
	[0x1e6020c8, "fcmp", 64, true],
	[0x1e2820f0, "fcmpe", 32, false],
	[0x1e6a2130, "fcmpe", 64, false],
	[0x1e202178, "fcmpe", 32, true],
	[0x1e602198, "fcmpe", 64, true]
]);

test("all assembler-proven FCMP and FCMPE forms decode", () => {
	for (const [word, mnemonic, width, compareWithZero] of FORMS) {
		const instruction = decodeAarch64Instruction(word);
		assert.equal(instruction.family, "floating-compare");
		assert.equal(instruction.mnemonic, mnemonic);
		assert.equal(instruction.width, width);
		assert.equal(instruction.compareWithZero, compareWithZero);
		assert.equal(instruction.signaling, mnemonic === "fcmpe");
	}
});

test("authentic FCMP S2, S0 sets equality flags and preserves state", () => {
	const registers = createAarch64Registers({
		nzcv: 0,
		programCounter: 0x1234n,
		stackPointer: 0x8000n
	});
	registers.write(8, 0x5566n);
	registers.writeFloat(2, 2, 32);
	registers.writeFloat(0, 2, 32);
	const beforeVectors = registers.vectors.snapshot();
	executeAarch64Data(decodeAarch64Instruction(0x1e202040), registers);
	assert.equal(registers.nzcv, 0b0110);
	assert.deepEqual(registers.vectors.snapshot(), beforeVectors);
	assert.equal(registers.read(8), 0x5566n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.pc, 0x1234n);
	assert.equal(evaluateAarch64Condition(0, registers.nzcv), true);
});

test("ordered comparisons set less, greater, and signed-zero equality flags", () => {
	assert.equal(compare(1, 2, 64), 0b1000);
	assert.equal(compare(3, 2, 64), 0b0010);
	assert.equal(compare(-0, 0, 64), 0b0110);
	assert.equal(evaluateAarch64Condition(11, 0b1000), true);
	assert.equal(evaluateAarch64Condition(12, 0b0010), true);
});

test("NaN in either operand produces unordered flags", () => {
	assert.equal(compare(Number.NaN, 1, 32), 0b0011);
	assert.equal(compare(1, Number.NaN, 32), 0b0011);
});

test("zero forms compare against positive zero for both mnemonics", () => {
	const registers = createAarch64Registers();
	registers.writeFloat(5, -1, 32);
	executeAarch64Data(decodeAarch64Instruction(0x1e2020a8), registers);
	assert.equal(registers.nzcv, 0b1000);
	registers.writeFloat(12, 0, 64);
	executeAarch64Data(decodeAarch64Instruction(0x1e602198), registers);
	assert.equal(registers.nzcv, 0b0110);
});

test("malformed zero forms and unsupported neighbors remain unknown", () => {
	for (const word of [
		0x1e2120a8,
		0x1ea02040,
		0x1e202041,
		0x00000000
	]) {
		assert.notEqual(decodeAarch64Instruction(word).family, "floating-compare");
	}
});

function compare(first, second, width) {
	const registers = createAarch64Registers();
	registers.writeFloat(2, first, width);
	registers.writeFloat(0, second, width);
	const word = width === 64 ? 0x1e602040 : 0x1e202040;
	executeAarch64Data(decodeAarch64Instruction(word), registers);
	return registers.nzcv;
}
