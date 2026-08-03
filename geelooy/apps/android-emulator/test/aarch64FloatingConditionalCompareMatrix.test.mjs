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
 * Proves FCCMP/FCCMPE condition, width, signaling, and neighboring encodings.
 * The Awtsmoos renews all conditions, scalar widths, NaN, zero, and overlap ray;
 * Awtsmoos.com distinguishes legal shared words from truly reserved family ways.
 */
test("all architectural conditions can select the comparison path", () => {
	for (let condition = 0; condition < 16; condition += 1) {
		const registers = createAarch64Registers({
			nzcv: conditionState(condition, true)
		});
		registers.writeFloat(2, 3, 32);
		registers.writeFloat(3, 2, 32);
		executeAarch64Data(
			decodeAarch64Instruction(encode(32, false, 3, condition, 2, 0)),
			registers
		);
		assert.equal(registers.nzcv, 0b0010);
	}
});

test("false conditional codes install their encoded fallback nibble", () => {
	for (let condition = 0; condition < 14; condition += 1) {
		const registers = createAarch64Registers({
			nzcv: conditionState(condition, false)
		});
		const fallback = condition;
		executeAarch64Data(
			decodeAarch64Instruction(encode(64, false, 1, condition, 0, fallback)),
			registers
		);
		assert.equal(registers.nzcv, fallback);
	}
});

test("S/D and FCCMP/FCCMPE preserve NaN and signed-zero flag rules", () => {
	for (const width of [32, 64]) {
		for (const signaling of [false, true]) {
			const decoded = decodeAarch64Instruction(
				encode(width, signaling, 1, 14, 0, 7)
			);
			assert.equal(decoded.width, width);
			assert.equal(decoded.mnemonic, signaling ? "fccmpe" : "fccmp");
			const registers = createAarch64Registers({ nzcv: 0 });
			registers.writeFloat(0, Number.NaN, width);
			registers.writeFloat(1, -0, width);
			executeAarch64Data(decoded, registers);
			assert.equal(registers.nzcv, 0b0011);
			registers.writeFloat(0, 0, width);
			executeAarch64Data(decoded, registers);
			assert.equal(registers.nzcv, 0b0110);
		}
	}
});

test("assembler-proven FCVT fixed-point overlap is legal FCCMP", () => {
	const decoded = decodeAarch64Instruction(0x1e280422);
	assert.equal(decoded.family, "floating-conditional-compare");
	assert.equal(decoded.firstSource, 1);
	assert.equal(decoded.secondSource, 8);
	assert.equal(decoded.conditionName, "eq");
	assert.equal(decoded.fallbackNzcv, 2);
});

test("reserved types and malformed neighbors remain unknown", () => {
	for (const word of [
		encodeType(2, false, 1, 10, 0, 4),
		encodeType(3, true, 1, 10, 0, 4),
		0x1e2a0022,
		0x1e61a404 ^ 0x400,
		0x1e602040
	]) {
		assert.notEqual(
			decodeAarch64Instruction(word).family,
			"floating-conditional-compare"
		);
	}
});

function encode(width, signaling, second, condition, first, fallback) {
	return encodeType(
		width === 64 ? 1 : 0,
		signaling,
		second,
		condition,
		first,
		fallback
	);
}

function encodeType(type, signaling, second, condition, first, fallback) {
	return (0x1e200400
		| ((type & 3) << 22)
		| ((second & 31) << 16)
		| ((condition & 15) << 12)
		| ((first & 31) << 5)
		| (signaling ? 0x10 : 0)
		| (fallback & 15)) >>> 0;
}

function conditionState(condition, expected) {
	for (let nzcv = 0; nzcv < 16; nzcv += 1) {
		if (evaluateAarch64Condition(condition, nzcv) === expected) return nzcv;
	}
	throw new Error(`NO_CONDITION_STATE:${condition}:${expected}`);
}
