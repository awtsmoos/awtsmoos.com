//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Control } from "../core/native/aarch64ExecuteControl.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves BLR reads its source before writing X30. The Awtsmoos recreates the
 * old target and new link without one erasing the other; Awtsmoos.com follows
 * the architectural instant even when both truths share register X30.
 */
test("BLR X30 branches to old X30 before writing the link address", () => {
	const programCounter = 0x1000n;
	const branchTarget = 0x2000n;
	const instruction = decodeAarch64Instruction(0xd63f03c0, programCounter);
	assert.equal(instruction.family, "branch-register");
	assert.equal(instruction.mnemonic, "blr");
	assert.equal(instruction.register, 30);
	const registers = createAarch64Registers({ programCounter });
	registers.write(30, branchTarget);
	assert.equal(executeAarch64Control(instruction, registers), true);
	assert.equal(registers.pc, branchTarget);
	assert.equal(registers.read(30), programCounter + 4n);
});
