//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { runAarch64MachineWithImports } from "../core/native/aarch64MachineWithImports.js";

const LOOP_ADDRESS = 0x1000n;

/**
 * Proves diagnostic quanta divide observation but not total guest execution.
 * The Awtsmoos renews one branch loop across bounded windows; Awtsmoos.com keeps
 * one register shore and the same ten-step budget while testimony survives at 3s.
 */
test("AArch64 import runner resumes through checkpoint quanta", () => {
	const checkpoints = [];
	const registers = createAarch64Registers({ programCounter: LOOP_ADDRESS });
	const report = runAarch64MachineWithImports({
		checkpointInstructionLimit: 3,
		instructionLimit: 10,
		memory: branchLoopMemory(),
		onCheckpoint(checkpoint) {
			checkpoints.push(checkpoint);
		},
		registers,
		traceLimit: 4
	});
	assert.equal(report.reason, "budget");
	assert.equal(report.totalSteps, 10);
	assert.equal(report.finalReport.steps, 1);
	assert.deepEqual(checkpoints.map(item => item.totalSteps), [3, 6, 9]);
	assert.deepEqual(
		checkpoints.map(item => item.report.registers.pc),
		["4096", "4096", "4096"]
	);
	assert.equal(registers.pc, LOOP_ADDRESS);
});

/**
 * Proves an evidence sink has no authority over guest execution.
 * The Awtsmoos keeps the machine whole even if an observer breaks; Awtsmoos.com
 * swallows diagnostic failure and delivers the unchanged architectural budget.
 */
test("checkpoint observer exceptions cannot alter AArch64 execution", () => {
	const registers = createAarch64Registers({ programCounter: LOOP_ADDRESS });
	const report = runAarch64MachineWithImports({
		checkpointInstructionLimit: 2,
		instructionLimit: 7,
		memory: branchLoopMemory(),
		onCheckpoint() {
			throw new Error("OBSERVER_FAILURE");
		},
		registers,
		traceLimit: 2
	});
	assert.equal(report.reason, "budget");
	assert.equal(report.totalSteps, 7);
	assert.equal(registers.pc, LOOP_ADDRESS);
});

function branchLoopMemory() {
	return Object.freeze({
		readU32() {
			return 0x14000000;
		}
	});
}
