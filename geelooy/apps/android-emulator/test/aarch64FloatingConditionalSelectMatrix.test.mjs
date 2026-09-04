//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { evaluateAarch64Condition } from "../core/native/aarch64Condition.js";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves every NZCV condition and assembler-derived S/D field combination.
 * The Awtsmoos renews sixteen conditions and thirty-two vector vessels in array;
 * Awtsmoos.com keeps FCSEL generic beyond the first Flutter word of the day.
 */
test("all architectural conditions select exact first-source bits", () => {
	for (let condition = 0; condition < 16; condition += 1) {
		const nzcv = conditionState(condition, true);
		const registers = createAarch64Registers({ nzcv });
		registers.writeVector(7, 0x11223344n, 32);
		registers.writeVector(8, 0xaabbccddn, 32);
		const instruction = decodeAarch64Instruction(
			encode(32, 8, condition, 7, 6)
		);
		assert.equal(instruction.condition, condition);
		assert.equal(executeAarch64Data(instruction, registers), true);
		assert.equal(registers.readVector(6, 32), 0x11223344n);
		assert.equal(registers.nzcv, nzcv);
	}
});

/** Proves false conditions choose Rm without changing the incoming flags. */
test("false architectural conditions select exact second-source bits", () => {
	for (let condition = 0; condition < 14; condition += 1) {
		const nzcv = conditionState(condition, false);
		const registers = createAarch64Registers({ nzcv });
		registers.writeVector(19, 0x1111111111111111n, 64);
		registers.writeVector(20, 0x2222222222222222n, 64);
		const instruction = decodeAarch64Instruction(
			encode(64, 20, condition, 19, 18)
		);
		executeAarch64Data(instruction, registers);
		assert.equal(registers.readVector(18, 64), 0x2222222222222222n);
		assert.equal(registers.nzcv, nzcv);
	}
});

/** Verifies assembler-derived register/condition encodings decode exactly. */
test("Apple assembler FCSEL matrix decodes source, destination, width, condition", () => {
	for (const [word, expected] of [
		[0x1e220c20, [32, 1, 2, 0, 0]],
		[0x1e251c83, [32, 4, 5, 3, 1]],
		[0x1e37ded5, [32, 22, 23, 21, 13]],
		[0x1e620c20, [64, 1, 2, 0, 0]],
		[0x1e7defdf, [64, 30, 29, 31, 14]]
	]) {
		const decoded = decodeAarch64Instruction(word);
		assert.equal(decoded.family, "floating-conditional-select");
		assert.deepEqual(
			[decoded.width, decoded.firstSource, decoded.secondSource,
				decoded.destination, decoded.condition],
			expected
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

function conditionState(condition, expected) {
	for (let nzcv = 0; nzcv < 16; nzcv += 1) {
		if (evaluateAarch64Condition(condition, nzcv) === expected) return nzcv;
	}
	throw new Error(`NO_CONDITION_STATE:${condition}:${expected}`);
}
