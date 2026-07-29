//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves EXTR and its ROR alias around the authentic Flutter hash word.
 * The Awtsmoos recreates high half, low half, shift, width, and zero shore;
 * Awtsmoos.com uses no host rotate intrinsic and no word-specific shortcut.
 */
test("authentic ROR X12, X12, 43 decodes and executes", () => {
	const instruction = decodeAarch64Instruction(0x93ccad8c, 4833440n);
	assert.deepEqual(shape(instruction), {
		destination: 12,
		family: "extract-register",
		firstSource: 12,
		mnemonic: "ror",
		secondSource: 12,
		shift: 43,
		width: 64
	});
	const registers = createAarch64Registers();
	registers.write(12, 10604543659537825212n, 64);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.read(12), 629655054920607069n);
});

test("assembler-derived W ROR and W EXTR preserve width", () => {
	assert.equal(run(0x13841c83, { 4: 0x12345678n }, 3, 32), 0xf02468acn);
	assert.equal(run(0x13872cc5, {
		6: 0x01234567n,
		7: 0x89abcdefn
	}, 5, 32), 0xacf13579n);
});

test("EXTR uses Rm as the low half at shifts zero, one, and sixty-three", () => {
	assert.equal(run(encode(64, 1, 2, 0, 3), {
		1: 0x1111111111111111n,
		2: 0x2222222222222222n
	}, 3, 64), 0x2222222222222222n);
	assert.equal(run(encode(64, 1, 2, 1, 3), {
		1: 0x1111111111111111n,
		2: 0x2222222222222222n
	}, 3, 64), 0x9111111111111111n);
	assert.equal(run(encode(64, 1, 2, 63, 3), {
		1: 0x1111111111111111n,
		2: 0x2222222222222222n
	}, 3, 64), 0x2222222222222222n);
});

test("register 31 remains zero while SP and NZCV are preserved", () => {
	const registers = createAarch64Registers({ stackPointer: 0x8000n });
	registers.nzcv = 0b1010;
	registers.write(2, 0xffffffffn, 32);
	const sourceZero = decodeAarch64Instruction(encode(32, 31, 2, 31, 4));
	executeAarch64Data(sourceZero, registers);
	assert.equal(registers.read(4, 32), 1n);
	const discard = decodeAarch64Instruction(encode(64, 1, 2, 7, 31));
	registers.write(1, 0x1234n);
	registers.write(2, 0x5678n);
	executeAarch64Data(discard, registers);
	assert.equal(registers.read(31), 0n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.nzcv, 0b1010);
});

test("reserved extract-register encodings remain unknown", () => {
	for (const word of [
		encode(32, 1, 2, 32, 3),
		(encode(32, 1, 2, 7, 3) | 0x00400000) >>> 0,
		(0x93ccad8c | 0x00200000) >>> 0
	]) {
		assert.equal(decodeAarch64Instruction(word).family, "unknown");
	}
});

function run(word, values, destination, width) {
	const instruction = decodeAarch64Instruction(word);
	const registers = createAarch64Registers();
	for (const [index, value] of Object.entries(values)) {
		registers.write(Number(index), value, width);
	}
	executeAarch64Data(instruction, registers);
	return registers.read(destination, width);
}

function encode(width, firstSource, secondSource, shift, destination) {
	const sf = width === 64 ? 1 : 0;
	return (0x13800000 + (sf * 0x80000000) + (sf * 0x00400000)
		+ (secondSource * 0x10000) + (shift * 0x400)
		+ (firstSource * 0x20) + destination) >>> 0;
}

function shape(instruction) {
	const keys = ["destination", "family", "firstSource", "mnemonic",
		"secondSource", "shift", "width"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
