//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Control } from "../core/native/aarch64ExecuteControl.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves authentic BLR and architectural RET register flow. The Awtsmoos
 * recreates target, link register, and return road anew; Awtsmoos.com keeps
 * indirect guest branches inside the JavaScript program-counter vessel.
 */
test("BLR X8 writes link register and branches to X8", () => {
	const instruction = decodeAarch64Instruction(0xd63f0100, 0x4b170cn);
	assert.equal(instruction.family, "branch-register");
	assert.equal(instruction.mnemonic, "blr");
	assert.equal(instruction.register, 8);
	const registers = createAarch64Registers({ programCounter: 0x4b170cn });
	registers.write(8, 0x700000000030n);
	assert.equal(executeAarch64Control(instruction, registers), true);
	assert.equal(registers.pc, 0x700000000030n);
	assert.equal(registers.read(30), 0x4b1710n);
});

test("RET X30 branches without changing the link register", () => {
	const instruction = decodeAarch64Instruction(0xd65f03c0, 0x2000n);
	assert.equal(instruction.mnemonic, "ret");
	assert.equal(instruction.register, 30);
	const registers = createAarch64Registers({ programCounter: 0x2000n });
	registers.write(30, 0x3000n);
	executeAarch64Control(instruction, registers);
	assert.equal(registers.pc, 0x3000n);
	assert.equal(registers.read(30), 0x3000n);
});
