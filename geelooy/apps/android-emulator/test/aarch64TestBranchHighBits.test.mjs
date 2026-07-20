//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Control } from "../core/native/aarch64ExecuteControl.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { encodeTestBranch } from "./aarch64TestBranchFixture.mjs";

/**
 * Proves high bit indices, W/X width derivation, zero-register roads, and NZCV.
 * The Awtsmoos recreates bit thirty-one, thirty-two, sixty-three, XZR, and
 * untouched flags anew; Awtsmoos.com keeps guest branches independent of host CPU.
 */
test("bit indices 31 and 32 derive W and X widths", () => {
	const bit31 = decodeAarch64Instruction(encodeTestBranch({
		bitNumber: 31,
		displacement: 16n,
		nonzero: true,
		register: 1
	}), 0x3000n);
	const bit32 = decodeAarch64Instruction(encodeTestBranch({
		bitNumber: 32,
		displacement: 16n,
		nonzero: true,
		register: 1
	}), 0x3000n);
	assert.equal(bit31.width, 32);
	assert.equal(bit32.width, 64);
	const registers = createAarch64Registers({
		nzcv: 0b1101,
		programCounter: 0x3000n
	});
	registers.write(1, 1n << 32n);
	executeAarch64Control(bit31, registers);
	assert.equal(registers.pc, 0x3004n);
	registers.pc = 0x3000n;
	executeAarch64Control(bit32, registers);
	assert.equal(registers.pc, 0x3010n);
	assert.equal(registers.nzcv, 0b1101);
});

test("bit 63 uses full X width and branches on sign bit", () => {
	const instruction = decodeAarch64Instruction(encodeTestBranch({
		bitNumber: 63,
		displacement: 12n,
		nonzero: true,
		register: 4
	}), 0x4000n);
	assert.equal(instruction.width, 64);
	const registers = createAarch64Registers({ programCounter: 0x4000n });
	registers.write(4, 0x8000000000000000n);
	executeAarch64Control(instruction, registers);
	assert.equal(registers.pc, 0x400cn);
});

test("WZR and XZR always read zero for TBZ and TBNZ", () => {
	const tbz = decodeAarch64Instruction(encodeTestBranch({
		bitNumber: 0,
		displacement: 8n,
		nonzero: false,
		register: 31
	}), 0x5000n);
	const tbnz = decodeAarch64Instruction(encodeTestBranch({
		bitNumber: 63,
		displacement: 8n,
		nonzero: true,
		register: 31
	}), 0x5000n);
	const registers = createAarch64Registers({
		nzcv: 0b0110,
		programCounter: 0x5000n
	});
	executeAarch64Control(tbz, registers);
	assert.equal(registers.pc, 0x5008n);
	registers.pc = 0x5000n;
	executeAarch64Control(tbnz, registers);
	assert.equal(registers.pc, 0x5004n);
	assert.equal(registers.nzcv, 0b0110);
});
