// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Watchdog = require("./parent-watchdog.js");

/**
 * @file Proves authorized consumer repair reaches only the exact execution-parent PID once.
 * @description
 * The Awtsmoos separates diagnosis from signal. Awtsmoos.com may let a sustained
 * consumer covenant authorize repair, but the actuator remains idempotent and bound
 * to the one parent process whose IPC child is performing the observation.
 */
let now = 10000;
const signals = [];
const lifecycle = [];
const consumerRecovery = {
	observe() {
		return {
			repairAuthorized: true,
			reason: "execution_consumer_stalled"
		};
	},
	snapshot() {
		return {
			repairAuthorized: true,
			reason: "repair_claimed",
			ledger: { history: [{ at: now }] }
		};
	}
};
const watchdog = Watchdog.create({
	now: () => now,
	startedAt: now,
	parentPid: 4321,
	consumerRecovery,
	signalParent(pid, signal) {
		signals.push([pid, signal]);
		return true;
	},
	recordLifecycle(event, details) {
		lifecycle.push({ event, details });
	},
	setTimer() {
		return { unref() {} };
	}
});

watchdog.pulse({ queued: 0, inflight: 0, lanes: {} });
const first = watchdog.inspect(
	{ registered: true },
	{ inbox: { count: 0, oldestAgeMs: 0 } }
);
assert.equal(first.repairRequired, true);
assert.equal(first.repairReason, "execution_consumer_stalled");
assert.deepEqual(signals, [[4321, "SIGTERM"]]);
assert.equal(lifecycle[0].details.targetPid, 4321);

now += 500;
watchdog.inspect(
	{ registered: true },
	{ inbox: { count: 0, oldestAgeMs: 0 } }
);
assert.deepEqual(signals, [[4321, "SIGTERM"]]);

console.log("BHY consumer recovery signals only the exact execution parent once");
