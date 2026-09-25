//B"H //Boruch Hashem //Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { runAarch64Machine } from "../core/native/aarch64Machine.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/** Proves silent and observed routing preserve identical machine semantics. */
test("AArch64 observer router preserves fast and observed budget state", () => {
	const fastRegisters = createAarch64Registers({ programCounter: 0x1000n });
	const observedRegisters = createAarch64Registers({ programCounter: 0x1000n });
	const memory = instructionMemory(0xd503201f);
	const fast = runAarch64Machine({ instructionLimit: 1, memory, registers: fastRegisters });
	const observed = runAarch64Machine({
		instructionLimit: 1,
		memory,
		onCallTransition() {},
		registers: observedRegisters
	});
	assert.equal(fast.reason, "budget");
	assert.equal(observed.reason, fast.reason);
	assert.equal(observed.totalSteps, fast.totalSteps);
	assert.equal(observedRegisters.pc, fastRegisters.pc);
	assert.equal(observedRegisters.read(30, 64, "zero"), fastRegisters.read(30, 64, "zero"));
});

function instructionMemory(word) {
	return Object.freeze({
		readU32(address) {
			assert.equal(address, 0x1000n);
			return word;
		}
	});
}
