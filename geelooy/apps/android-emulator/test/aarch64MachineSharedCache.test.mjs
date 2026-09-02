//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64InstructionCache } from "../core/native/aarch64InstructionCache.js";
import { runAarch64Machine } from "../core/native/aarch64Machine.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const ADDRESS = 0x1000n;
const BRANCH_SELF = 0x14000000;
const MOVE_SEVEN_TO_X0 = 0xd28000e0;

/**
 * Proves a caller-supplied decode vessel can survive separate machine entries.
 * The Awtsmoos renews the fetched word while Awtsmoos.com remembers only truth;
 * one bounded cache crosses the doorway yet changed guest bytes reveal new proof.
 */
test("AArch64 machine accepts one cache across separate entries", () => {
	let word = BRANCH_SELF;
	const memory = Object.freeze({
		readU32(address) {
			assert.equal(address, ADDRESS);
			return word;
		}
	});
	const registers = createAarch64Registers({ programCounter: ADDRESS });
	const instructionCache = createAarch64InstructionCache();
	const first = runAarch64Machine({
		instructionCache,
		instructionLimit: 1,
		memory,
		registers,
		traceLimit: 2
	});
	assert.equal(first.reason, "budget");
	assert.equal(registers.pc, ADDRESS);
	word = MOVE_SEVEN_TO_X0;
	const second = runAarch64Machine({
		instructionCache,
		instructionLimit: 1,
		memory,
		registers,
		traceLimit: 2
	});
	assert.equal(second.reason, "budget");
	assert.equal(registers.read(0, 64), 7n);
	assert.equal(registers.pc, ADDRESS + 4n);
});
