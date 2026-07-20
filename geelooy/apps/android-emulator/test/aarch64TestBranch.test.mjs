//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Control } from "../core/native/aarch64ExecuteControl.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import {
	encodeTestBranch,
	testBranchShape
} from "./aarch64TestBranchFixture.mjs";

/**
 * Proves the authentic TBNZ word and low-bit taken or fall-through roads.
 * The Awtsmoos recreates W0, selected bit, branch target, next PC, and NZCV
 * anew; Awtsmoos.com needs no APK, memory image, JNI state, or host CPU.
 */
test("authentic TBNZ W0, #0 branches by 36 bytes", () => {
	const instruction = decodeAarch64Instruction(0x37000120, 4793168n);
	assert.deepEqual(testBranchShape(instruction), {
		bitNumber: 0,
		displacement: "36",
		family: "test-branch",
		mnemonic: "tbnz",
		register: 0,
		target: "4793204",
		width: 32
	});
	const registers = createAarch64Registers({
		nzcv: 0b0100,
		programCounter: 4793168n
	});
	registers.write(0, 1n, 32);
	assert.equal(executeAarch64Control(instruction, registers), true);
	assert.equal(registers.pc, 4793204n);
	assert.equal(registers.nzcv, 0b0100);
});

test("TBNZ falls through and TBZ takes when selected bit is zero", () => {
	const tbnz = decodeAarch64Instruction(encodeTestBranch({
		bitNumber: 5,
		displacement: 20n,
		nonzero: true,
		register: 2
	}), 0x1000n);
	const registers = createAarch64Registers({
		nzcv: 0b1010,
		programCounter: 0x1000n
	});
	registers.write(2, 0n, 32);
	executeAarch64Control(tbnz, registers);
	assert.equal(registers.pc, 0x1004n);
	assert.equal(registers.nzcv, 0b1010);
	const tbz = decodeAarch64Instruction(encodeTestBranch({
		bitNumber: 5,
		displacement: 20n,
		nonzero: false,
		register: 2
	}), 0x1000n);
	registers.pc = 0x1000n;
	executeAarch64Control(tbz, registers);
	assert.equal(registers.pc, 0x1014n);
	assert.equal(registers.nzcv, 0b1010);
});

test("negative displacement computes an exact backward target", () => {
	const instruction = decodeAarch64Instruction(encodeTestBranch({
		bitNumber: 7,
		displacement: -32n,
		nonzero: false,
		register: 3
	}), 0x2000n);
	assert.equal(instruction.displacement, "-32");
	assert.equal(instruction.target, "8160");
});
