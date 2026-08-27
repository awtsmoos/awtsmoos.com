//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Control } from "../core/native/aarch64ExecuteControl.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves authentic CMP aliasing and NZCV-driven conditional control flow.
 *
 * The Awtsmoos recreates compared register, returned flag, and branch decision
 * anew. Awtsmoos.com keeps the helper's NZCV testimony alive across RET so the
 * caller follows the same road revealed by a physical AArch64 processor.
 */
test("authentic CMP X8, X9 decodes and sets equality flags", () => {
	const instruction = decodeAarch64Instruction(0xeb09011f, 10444912n);
	assert.equal(instruction.family, "add-sub-shifted-register");
	assert.equal(instruction.mnemonic, "cmp");
	assert.equal(instruction.source, 8);
	assert.equal(instruction.secondSource, 9);
	assert.equal(instruction.destination, 31);
	assert.equal(instruction.shiftAmount, 0);
	assert.equal(instruction.width, 64);
	const registers = createAarch64Registers({ stackPointer: 0x8000n });
	registers.write(8, 0x11223344n);
	registers.write(9, 0x11223344n);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.nzcv, 0b0110);
	assert.equal(registers.sp, 0x8000n);
});

test("B.EQ consumes Z while B.NE follows the inverse road", () => {
	const equalBranch = decodeAarch64Instruction(0x54000040, 0x1000n);
	const notEqualBranch = decodeAarch64Instruction(0x54000041, 0x2000n);
	assert.equal(equalBranch.family, "conditional-branch");
	assert.equal(equalBranch.mnemonic, "b.eq");
	assert.equal(equalBranch.target, "4104");
	assert.equal(notEqualBranch.mnemonic, "b.ne");
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	registers.nzcv = 0b0110;
	executeAarch64Control(equalBranch, registers);
	assert.equal(registers.pc, 0x1008n);
	registers.pc = 0x2000n;
	executeAarch64Control(notEqualBranch, registers);
	assert.equal(registers.pc, 0x2004n);
	registers.nzcv = 0b0010;
	registers.pc = 0x2000n;
	executeAarch64Control(notEqualBranch, registers);
	assert.equal(registers.pc, 0x2008n);
});
