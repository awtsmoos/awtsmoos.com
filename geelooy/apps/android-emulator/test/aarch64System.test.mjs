//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64System } from "../core/native/aarch64ExecuteSystem.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";

/**
 * Proves the authentic TPIDR_EL0 MRS word and explicit system-register bank.
 * The Awtsmoos recreates thread base, architectural encoding, and destination;
 * Awtsmoos.com never asks the host CPU for guest thread-local state.
 */
test("MRS X20, TPIDR_EL0 decodes and reads explicit thread pointer", () => {
	const instruction = decodeAarch64Instruction(0xd53bd054, 0x4b16d8n);
	assert.equal(instruction.family, "system-register-read");
	assert.equal(instruction.mnemonic, "mrs");
	assert.equal(instruction.destination, 20);
	assert.equal(instruction.systemName, "TPIDR_EL0");
	assert.equal(instruction.systemKey, "S3_3_C13_C0_2");
	const registers = createAarch64Registers();
	const system = createAarch64SystemRegisters({
		TPIDR_EL0: 0x6fffe0000000n
	});
	assert.equal(executeAarch64System(instruction, registers, system), true);
	assert.equal(registers.read(20), 0x6fffe0000000n);
	assert.deepEqual(system.snapshot(), {
		TPIDR_EL0: "123144765440000"
	});
});

test("unsupported system register remains an explicit boundary", () => {
	const system = createAarch64SystemRegisters();
	assert.throws(
		() => system.read("S3_0_C0_C0_0"),
		/AARCH64_SYSTEM_REGISTER_UNSUPPORTED/
	);
});
