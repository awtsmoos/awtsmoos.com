//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const OPERATIONS = Object.freeze(["lslv", "lsrv", "asrv", "rorv"]);

test("authentic ROR X1, X8, X20 decodes and executes", () => {
	const instruction = decodeAarch64Instruction(0x9ad42d01, 4833132n);
	assert.deepEqual(shape(instruction), {
		destination: 1,
		family: "variable-shift",
		mnemonic: "rorv",
		shiftSource: 20,
		source: 8,
		width: 64
	});
	const registers = createAarch64Registers();
	registers.write(8, 0x0123456789abcdefn);
	registers.write(20, 14n);
	executeAarch64Data(instruction, registers);
	assert.equal(registers.read(1), 0x37bc048d159e26afn);
});

test("all four operations decode in W and X widths", () => {
	for (const width of [32, 64]) {
		for (let operation = 0; operation < OPERATIONS.length; operation += 1) {
			const decoded = decodeAarch64Instruction(encode(width, operation, 2, 3, 4));
			assert.equal(decoded.family, "variable-shift");
			assert.equal(decoded.mnemonic, OPERATIONS[operation]);
			assert.equal(decoded.width, width);
		}
	}
});

test("shift amounts are masked to the selected width", () => {
	assert.equal(run(32, 0, 1n, 33n), 2n);
	assert.equal(run(64, 1, 0x8000000000000000n, 65n), 0x4000000000000000n);
	assert.equal(run(32, 2, 0x80000000n, 31n), 0xffffffffn);
	assert.equal(run(32, 3, 0x80000001n, 33n), 0xc0000000n);
});

test("zero shifts are identities and W reads ignore X high halves", () => {
	assert.equal(run(64, 3, 0x123456789abcdef0n, 64n), 0x123456789abcdef0n);
	assert.equal(run(32, 1, 0xdeadbeef80000000n, 0n), 0x80000000n);
});

test("register 31 remains zero while SP, PC, and NZCV are preserved", () => {
	const registers = createAarch64Registers({
		nzcv: 10,
		programCounter: 0x4444n,
		stackPointer: 0x8000n
	});
	registers.write(1, 7n);
	let instruction = decodeAarch64Instruction(encode(64, 0, 1, 31, 2));
	executeAarch64Data(instruction, registers);
	assert.equal(registers.read(2), 0n);
	instruction = decodeAarch64Instruction(encode(64, 3, 1, 31, 31));
	executeAarch64Data(instruction, registers);
	assert.equal(registers.read(31), 0n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.pc, 0x4444n);
	assert.equal(registers.nzcv, 10);
});

test("unrelated two-source encodings remain outside variable shifts", () => {
	for (const word of [0x9ac20c00, 0x9ac03000, 0xd503201f, 0x00000000]) {
		assert.notEqual(decodeAarch64Instruction(word).family, "variable-shift");
	}
});

function run(width, operation, source, shift) {
	const registers = createAarch64Registers();
	registers.write(1, source, width);
	registers.write(2, shift, width);
	const instruction = decodeAarch64Instruction(encode(width, operation, 2, 1, 3));
	executeAarch64Data(instruction, registers);
	return registers.read(3, width);
}

function encode(width, operation, shiftSource, source, destination) {
	return (0x1ac02000 | ((width === 64 ? 1 : 0) << 31)
		| (shiftSource << 16) | (operation << 10)
		| (source << 5) | destination) >>> 0;
}

function shape(instruction) {
	const keys = ["destination", "family", "mnemonic", "shiftSource",
		"source", "width"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
