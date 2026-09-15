//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { runAarch64Machine } from "../core/native/aarch64Machine.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/** Proves direct BL testimony records source, target, step, and link shore before execution. */
test("AArch64 call-transition hook observes direct BL", () => {
	const events = [];
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	runAarch64Machine({
		instructionLimit: 1,
		memory: instructionMemory(0x94000004),
		onCallTransition: event => events.push(event),
		registers
	});
	assert.deepEqual(events, [{
		mnemonic: "bl",
		returnAddress: "4100",
		source: "4096",
		step: 0,
		target: "4112"
	}]);
});

test("AArch64 call-transition hook observes BLR target before X30 changes", () => {
	const events = [];
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	registers.write(5, 0x100000120n, 64, "zero");
	runAarch64Machine({
		instructionLimit: 1,
		memory: instructionMemory(0xd63f00a0),
		onCallTransition: event => events.push(event),
		registers
	});
	assert.deepEqual(events, [{
		mnemonic: "blr",
		returnAddress: "4100",
		source: "4096",
		step: 0,
		target: "4294967584"
	}]);
});

/** Creates the exact machine fetch boundary needed by a one-instruction control fixture. */
function instructionMemory(word) {
	return Object.freeze({
		readU32(address) {
			assert.equal(address, 0x1000n);
			return word;
		}
	});
}
