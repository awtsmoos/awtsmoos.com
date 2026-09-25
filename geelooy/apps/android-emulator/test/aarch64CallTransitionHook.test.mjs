//B"H //Boruch Hashem //Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { runAarch64Machine } from "../core/native/aarch64Machine.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const ISOLATE_TARGET = 0x100306a40n;

/** Proves direct BL testimony receives raw addresses and the live pre-call register bank. */
test("AArch64 call-transition hook observes direct BL", () => {
	const { events } = observeWord(0x94000004, registers => registers.write(0, 77n, 64, "zero"));
	assert.deepEqual(events[0], {
		event: { mnemonic: "bl", returnAddress: 4100n, source: 4096n, step: 0, target: 4112n },
		x30: 0n
	});
});

/** Proves BLR target is captured before architectural X30 linking. */
test("AArch64 call-transition hook observes BLR before X30 changes", () => {
	const { events } = observeWord(0xd63f00a0, registers => {
		registers.write(5, ISOLATE_TARGET, 64, "zero");
		registers.write(30, 0x5555n, 64, "zero");
	});
	assert.equal(events[0].event.mnemonic, "blr");
	assert.equal(events[0].event.target, ISOLATE_TARGET);
	assert.equal(events[0].x30, 0x5555n);
});

/** Proves BR indirect target is captured without linking or target mutation. */
test("AArch64 call-transition hook observes BR target", () => {
	const { events, registers } = observeWord(0xd61f00a0, state => {
		state.write(5, ISOLATE_TARGET, 64, "zero");
		state.write(30, 0x7777n, 64, "zero");
	});
	assert.equal(events[0].event.mnemonic, "br");
	assert.equal(events[0].event.target, ISOLATE_TARGET);
	assert.equal(events[0].x30, 0x7777n);
	assert.equal(registers.read(30, 64, "zero"), 0x7777n);
});

/** Proves RET testimony reads X30 before execution redirects PC. */
test("AArch64 call-transition hook observes RET target", () => {
	const { events } = observeWord(0xd65f03c0, registers => registers.write(30, ISOLATE_TARGET, 64, "zero"));
	assert.equal(events[0].event.mnemonic, "ret");
	assert.equal(events[0].event.target, ISOLATE_TARGET);
	assert.equal(events[0].x30, ISOLATE_TARGET);
});

function observeWord(word, setup) {
	const events = [];
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	setup(registers);
	runAarch64Machine({
		instructionLimit: 1,
		memory: instructionMemory(word),
		onCallTransition: (event, live) => events.push({ event, x30: live.read(30, 64, "zero") }),
		registers
	});
	return { events, registers };
}

function instructionMemory(word) {
	return Object.freeze({ readU32(address) { assert.equal(address, 0x1000n); return word; } });
}
