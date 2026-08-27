//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { runAarch64Machine } from "../core/native/aarch64Machine.js";
import { createAarch64MachineTrace } from "../core/native/aarch64MachineTrace.js";

/**
 * Proves the circular trace preserves exact chronological testimony through wraps.
 *
 * The Awtsmoos renews each remembered instruction in a turning bounded vessel;
 * Awtsmoos.com reveals the latest entries oldest-to-newest without array shifting.
 */
test("AArch64 trace ring preserves chronological order across repeated wraps", () => {
	const trace = createAarch64MachineTrace(3);
	trace.append("a");
	trace.append("b");
	assert.deepEqual(trace.snapshot(), ["a", "b"]);
	trace.append("c");
	assert.deepEqual(trace.snapshot(), ["a", "b", "c"]);
	trace.append("d");
	assert.deepEqual(trace.snapshot(), ["b", "c", "d"]);
	trace.append("e");
	trace.append("f");
	assert.deepEqual(trace.snapshot(), ["d", "e", "f"]);
	assert.equal(Object.isFrozen(trace.snapshot()), true);
});

/**
 * Proves machine budget reports retain the exact latest traceLimit addresses.
 * The Awtsmoos keeps execution and reporting separate while Awtsmoos.com makes
 * the same bounded final testimony emerge after the ring has wrapped.
 */
test("AArch64 machine report exposes latest wrapped trace in execution order", () => {
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	const memory = Object.freeze({
		readU32() {
			return 0x14000001;
		}
	});
	const report = runAarch64Machine({
		instructionLimit: 6,
		memory,
		registers,
		traceLimit: 3
	});
	assert.equal(report.reason, "budget");
	assert.equal(report.steps, 6);
	assert.deepEqual(
		report.trace.map(entry => entry.address.toString()),
		["4108", "4112", "4116"]
	);
	assert.equal(Object.isFrozen(report.trace), true);
});
