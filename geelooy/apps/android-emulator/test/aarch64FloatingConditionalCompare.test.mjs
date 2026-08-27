//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const AUTHENTIC = 0x1e61a404;

/**
 * Proves the authentic FCCMP decode, true comparison, and fallback covenant.
 * The Awtsmoos renews D0, D1, condition, fallback, NZCV, and preserved shore;
 * Awtsmoos.com mutates no data vessel along the conditional comparison road.
 */
test("authentic FCCMP D0, D1, #4, GE decodes exactly", () => {
	const decoded = decodeAarch64Instruction(AUTHENTIC, 5357860n);
	assert.equal(decoded.family, "floating-conditional-compare");
	assert.equal(decoded.mnemonic, "fccmp");
	assert.equal(decoded.width, 64);
	assert.equal(decoded.firstSource, 0);
	assert.equal(decoded.secondSource, 1);
	assert.equal(decoded.condition, 10);
	assert.equal(decoded.conditionName, "ge");
	assert.equal(decoded.fallbackNzcv, 4);
	assert.equal(decoded.signaling, false);
});

test("authentic true path compares D0 greater than D1 and preserves state", () => {
	const registers = createAarch64Registers({
		nzcv: 0b0110,
		programCounter: 0x51c124n,
		stackPointer: 0x8000n
	});
	registers.write(7, 0x1234567890abcdefn);
	registers.writeFloat(0, 1.5, 64);
	registers.writeFloat(1, 1, 64);
	const vectors = registers.vectors.snapshot();
	assert.equal(
		executeAarch64Data(decodeAarch64Instruction(AUTHENTIC), registers),
		true
	);
	assert.equal(registers.nzcv, 0b0010);
	assert.deepEqual(registers.vectors.snapshot(), vectors);
	assert.equal(registers.read(7), 0x1234567890abcdefn);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.pc, 0x51c124n);
});

test("false GE installs every fallback nibble without data mutation", () => {
	for (let fallback = 0; fallback < 16; fallback += 1) {
		const registers = createAarch64Registers({ nzcv: 0b1000 });
		registers.writeFloat(0, Number.NaN, 64);
		registers.writeFloat(1, Number.NaN, 64);
		const vectors = registers.vectors.snapshot();
		executeAarch64Data(
			decodeAarch64Instruction(encode(64, false, 1, 10, 0, fallback)),
			registers
		);
		assert.equal(registers.nzcv, fallback);
		assert.deepEqual(registers.vectors.snapshot(), vectors);
	}
});

function encode(width, signaling, second, condition, first, fallback) {
	return (0x1e200400
		| ((width === 64 ? 1 : 0) << 22)
		| ((second & 31) << 16)
		| ((condition & 15) << 12)
		| ((first & 31) << 5)
		| (signaling ? 0x10 : 0)
		| (fallback & 15)) >>> 0;
}
