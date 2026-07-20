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
 * Proves the authentic TST word, aliases, zero-register semantics, and flags.
 * The Awtsmoos recreates W0, low-byte mask, discarded result, Z flag, and MOV
 * alias anew; Awtsmoos.com needs no APK, JNI state, memory image, or host CPU.
 */
test("authentic TST W0, #0xff decodes and sets Z on zero", () => {
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
	const registers = createAarch64Registers({ nzcv: 0b1111 });
	registers.write(0, 0n, 32);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.read(0, 32), 0n);
	assert.equal(registers.read(31), 0n);
	assert.equal(registers.nzcv, 0b0100);
});

test("TST updates flags while discarding a nonzero result", () => {
	const instruction = decodeAarch64Instruction(0x72001c1f);
	const registers = createAarch64Registers({ nzcv: 0b1111 });
	registers.write(0, 0x101n, 32);
	executeAarch64Data(instruction, registers);
	assert.equal(registers.read(0, 32), 0x101n);
	assert.equal(registers.nzcv, 0);
});

test("ORR from WZR exposes MOV alias and writes immediate mask", () => {
	const instruction = decodeAarch64Instruction(encodeLogicalImmediate({
		destination: 4,
		immr: 0,
		imms: 7,
		n: 0,
		operation: 1,
		source: 31,
		width: 32
	}));
	assert.equal(instruction.mnemonic, "mov");
	assert.equal(instruction.operationName, "orr");
	const registers = createAarch64Registers({ nzcv: 0b1010 });
	executeAarch64Data(instruction, registers);
	assert.equal(registers.read(4), 0xffn);
	assert.equal(registers.nzcv, 0b1010);
});
