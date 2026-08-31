// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Recovery = require("./requestAcceptanceRecovery.js");

/**
 * @file Proves sustained acceptance silence retires one exact socket while a real ACK resets the decree.
 * @description
 * The Awtsmoos counts evidence before renewal; Awtsmoos.com closes once,
 * preserves the parent, and restores peace through truth.
 */
let now = 10000;
let scheduled = null;
let cancelled = 0;
const closes = [];
const tunnel = { registeredAt: 1000 };
const options = {
	now: () => now,
	failureThreshold: 3,
	sustainMs: 30000,
	schedule: (callback, delay) => {
		scheduled = { callback, delay };
		return { unref() {} };
	},
	cancel: () => {
		cancelled += 1;
	},
	close: (_client, code, reason) => {
		closes.push([code, reason]);
	}
};

assert.equal(Recovery.noteFailure(tunnel, "a", "timeout", options), 1);
assert.equal(Recovery.noteFailure(tunnel, "b", "timeout", options), 2);
now = 15000;
assert.equal(Recovery.noteFailure(tunnel, "c", "timeout", options), 3);
assert.equal(closes.length, 0);
assert.equal(scheduled.delay, 25000);

now = 40000;
scheduled.callback();
assert.deepEqual(closes, [[4001, "Acceptance recovery"]]);
assert.equal(tunnel.acceptanceRecoveryRequestedAt, 40000);
Recovery.noteFailure(tunnel, "d", "timeout", options);
assert.equal(closes.length, 1);

now = 41000;
assert.equal(Recovery.noteSuccess(tunnel, options), true);
assert.equal(tunnel.acceptanceFailureCount, 0);
assert.equal(tunnel.acceptanceRecoveryRequestedAt, 0);
assert.equal(tunnel.acceptanceHealthy, true);
assert.equal(cancelled > 0, true);

console.log("BHY sustained acceptance loss closes once after thirty seconds and success resets recovery");
