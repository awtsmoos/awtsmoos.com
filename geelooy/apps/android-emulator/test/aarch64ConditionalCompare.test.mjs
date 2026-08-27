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
 * Proves complete CCMP/CCMN arithmetic and fallback-flag semantics.
 * The Awtsmoos recreates condition, operand, comparison, and NZCV testimony anew;
 * Awtsmoos.com tests the whole family rather than one observed equality check.
 */
test("authentic CCMP X8 immediate word decodes exactly", () => {
	const decoded = decodeAarch64Instruction(0xfa430902, 5739064n);
	assert.equal(decoded.family, "conditional-compare");
	assert.equal(decoded.mnemonic, "ccmp");
	assert.equal(decoded.width, 64);
	assert.equal(decoded.source, 8);
	assert.equal(decoded.operandType, "immediate");
	assert.equal(decoded.operand, 3);
	assert.equal(decoded.conditionName, "eq");
	assert.equal(decoded.fallbackNzcv, 2);
});

test("all eight local toolchain forms decode inside one family", () => {
	const words = [
		0xfa430902, 0xba430902, 0xfa430102, 0xba430102,
		0x7a5f190f, 0x3a40e900, 0x7a43c907, 0x3a43b908
	];
	for (const word of words) {
		assert.equal(decodeAarch64Instruction(word).family, "conditional-compare");
	}
});

test("true CCMP and CCMN paths compute exact arithmetic NZCV", () => {
	const registers = createAarch64Registers();
	registers.write(8, 3n);
	registers.nzcv = 4;
	executeAarch64Data(decodeAarch64Instruction(0xfa430902), registers);
	assert.equal(registers.nzcv, 6);
	registers.write(8, 0x7fffffffn, 32);
	registers.nzcv = 0;
	const ccmn = encode(false, 32, true, 1, 14, 8, 0);
	executeAarch64Data(decodeAarch64Instruction(ccmn), registers);
	assert.equal(registers.nzcv, 9);
});

test("false conditions install every encoded fallback nibble", () => {
	for (let fallback = 0; fallback < 16; fallback += 1) {
		const registers = createAarch64Registers();
		registers.nzcv = 0;
		const word = encode(true, 64, true, 0, 0, 0, fallback);
		executeAarch64Data(decodeAarch64Instruction(word), registers);
		assert.equal(registers.nzcv, fallback);
	}
});

test("all conditions select arithmetic without data-register mutation", () => {
	for (let condition = 0; condition < 16; condition += 1) {
		const registers = createAarch64Registers();
		registers.write(2, 5n);
		registers.write(3, 5n);
		registers.nzcv = findConditionState(condition, true);
		const before = registers.read(2);
		const word = encode(true, 64, false, 3, condition, 2, 1);
		executeAarch64Data(decodeAarch64Instruction(word), registers);
		assert.equal(registers.nzcv, 6);
		assert.equal(registers.read(2), before);
	}
});

export function encodeConditionalCompare(
	subtract,
	width,
	immediate,
	operand,
	condition,
	source,
	fallback
) {
	return (0x3a400000 + (width === 64 ? 0x80000000 : 0)
		+ (subtract ? 0x40000000 : 0) + (operand * 0x10000)
		+ (condition * 0x1000) + (immediate ? 0x800 : 0)
		+ (source * 0x20) + fallback) >>> 0;
}

function encode(...arguments_) {
	return encodeConditionalCompare(...arguments_);
}

function findConditionState(condition, expected) {
	for (let nzcv = 0; nzcv < 16; nzcv += 1) {
		if (evaluateAarch64Condition(condition, nzcv) === expected) return nzcv;
	}
	throw new Error(`NO_CONDITION_STATE:${condition}:${expected}`);
}
