//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import {
	encodeLogicalImmediate,
	logicalImmediateShape
} from "./aarch64LogicalImmediateFixture.mjs";

/**
 * Proves authentic TST, all canonical operations, aliases, widths, and flags.
 * The Awtsmoos recreates source, repeated mask, result, zero-register shore, and
 * NZCV anew; Awtsmoos.com needs no APK, ELF, JNI, native memory, or browser.
 */
test("authentic TST W0, #0xff decodes and updates Z", () => {
	const instruction = decodeAarch64Instruction(0x72001c1f, 4923748n);
	assert.deepEqual(logicalImmediateShape(instruction), {
		destination: 31,
		elementSize: 32,
		family: "logical-immediate",
		immediate: "255",
		mnemonic: "tst",
		onesLength: 8,
		operation: 3,
		operationName: "ands",
		rotation: 0,
		source: 0,
		supported: true,
		width: 32
	});
	const registers = createAarch64Registers();
	registers.write(0, 0x100n, 32);
	registers.nzcv = 0xf;
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.read(31, 32, "zero"), 0n);
	assert.equal(registers.nzcv, 0x4);
});

test("AND ORR EOR and ANDS execute exact 32-bit values", () => {
	const expected = [0x0fn, 0xffn, 0xf0n, 0x0fn];
	for (let operation = 0; operation < 4; operation += 1) {
		const word = encodeLogicalImmediate({
			destination: 1,
			immr: 0,
			imms: 7,
			n: 0,
			operation,
			source: 0,
			width: 32
		});
		const instruction = decodeAarch64Instruction(word);
		const registers = createAarch64Registers();
		registers.write(0, 0x0fn, 32);
		registers.nzcv = 0x9;
		executeAarch64Data(instruction, registers);
		assert.equal(registers.read(1), expected[operation]);
		assert.equal(registers.nzcv, operation === 3 ? 0 : 0x9);
	}
});

test("ORR Xd, XZR, immediate exposes MOV alias at 64 bits", () => {
	const word = encodeLogicalImmediate({
		destination: 5,
		immr: 0,
		imms: 7,
		n: 1,
		operation: 1,
		source: 31,
		width: 64
	});
	const instruction = decodeAarch64Instruction(word);
	assert.equal(instruction.mnemonic, "mov");
	assert.equal(instruction.immediate, "255");
	const registers = createAarch64Registers();
	registers.nzcv = 0xa;
	executeAarch64Data(instruction, registers);
	assert.equal(registers.read(5), 0xffn);
	assert.equal(registers.nzcv, 0xa);
});

test("rotated masks and invalid encodings preserve architectural boundaries", () => {
	const rotated = decodeAarch64Instruction(encodeLogicalImmediate({
		destination: 3,
		immr: 4,
		imms: 7,
		n: 0,
		operation: 2,
		source: 2,
		width: 32
	}));
	const registers = createAarch64Registers();
	registers.write(2, 0xffffffffn, 32);
	executeAarch64Data(rotated, registers);
	assert.equal(registers.read(3), 0x0ffffff0n);
	const invalid = decodeAarch64Instruction(encodeLogicalImmediate({
		destination: 4,
		immr: 0,
		imms: 7,
		n: 1,
		operation: 0,
		source: 2,
		width: 32
	}));
	registers.write(4, 0x1234n);
	registers.nzcv = 0xb;
	assert.equal(invalid.supported, false);
	assert.equal(executeAarch64Data(invalid, registers), false);
	assert.equal(registers.read(4), 0x1234n);
	assert.equal(registers.nzcv, 0xb);
});
