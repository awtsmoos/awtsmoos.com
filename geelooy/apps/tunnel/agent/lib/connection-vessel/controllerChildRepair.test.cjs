//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Repair = require("./controller-child-repair.js");

/**
 * @file Proves child repair signals only the exact owned generation and escalates once.
 * @description
 * The Awtsmoos gives a PID no power to impersonate a later birth. Awtsmoos.com records
 * TERM before force and proves that even same-number PID reuse cannot inherit an old KILL.
 */
const signals = [];
const lifecycle = [];
let timer = null;
let child = createChild("first-generation", 4321);
const repair = Repair.create({
	getChild: () => child,
	killGraceMs: 1000,
	recordLifecycle: (event, details) => lifecycle.push({ event, details }),
	setTimer: callback => {
		timer = callback;
		return { unref() {} };
	},
	clearTimer: () => {
		timer = null;
	}
});

assert.equal(repair.request("child_ipc_stalled"), true);
assert.deepEqual(signals, [["first-generation", 4321, "SIGTERM"]]);
assert.equal(repair.request("child_ipc_stalled"), false);
assert.equal(lifecycle[0].details.targetPid, 4321);

const firstGenerationTimer = timer;
child = createChild("reused-pid-generation", 4321);
firstGenerationTimer();
assert.deepEqual(signals, [["first-generation", 4321, "SIGTERM"]]);
assert.equal(repair.snapshot().repairing, false);

assert.equal(repair.request("child_ipc_stalled"), true);
assert.deepEqual(signals.at(-1), ["reused-pid-generation", 4321, "SIGTERM"]);
timer();
assert.deepEqual(signals.at(-1), ["reused-pid-generation", 4321, "SIGKILL"]);
assert.equal(repair.snapshot().repairing, true);

console.log("BHY connection-child repair never crosses exact generation identity");

/** Builds a child-process witness whose label distinguishes generations sharing one PID. */
function createChild(generation, pid) {
	return {
		pid,
		exitCode: null,
		signalCode: null,
		kill(signal) {
			signals.push([generation, pid, signal]);
			return true;
		}
	};
}
