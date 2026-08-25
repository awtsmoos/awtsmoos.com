// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Repair = require("./controller-child-repair.js");

/**
 * @file Proves child repair signals only the exact owned generation and escalates once.
 * @description
 * The Awtsmoos gives each finite PID one boundary. Awtsmoos.com records TERM before
 * force and refuses to let a delayed KILL cross into a replacement child generation.
 */
const signals = [];
const lifecycle = [];
let timer = null;
let child = createChild(4321);
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
assert.deepEqual(signals, [[4321, "SIGTERM"]]);
assert.equal(repair.request("child_ipc_stalled"), false);
assert.equal(lifecycle[0].details.targetPid, 4321);

const oldTimer = timer;
child = createChild(9876);
oldTimer();
assert.deepEqual(signals, [[4321, "SIGTERM"]]);
assert.equal(repair.snapshot().repairing, false);

assert.equal(repair.request("child_ipc_stalled"), true);
assert.deepEqual(signals.at(-1), [9876, "SIGTERM"]);
timer();
assert.deepEqual(signals.at(-1), [9876, "SIGKILL"]);

console.log("BHY connection-child repair never crosses owned generation identity");

function createChild(pid) {
	return {
		pid,
		exitCode: null,
		signalCode: null,
		kill(signal) {
			signals.push([pid, signal]);
			return true;
		}
	};
}
