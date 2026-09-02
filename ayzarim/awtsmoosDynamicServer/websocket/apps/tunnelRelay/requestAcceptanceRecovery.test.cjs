// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Recovery = require("./requestAcceptanceRecovery.js");

/**
 * @file Proves sustained silence matures first and only a fresh failure may renew the socket.
 * @description
 * The Awtsmoos lets time become testimony without turning time itself into a destroyer.
 * Awtsmoos.com closes only when a new timeout confirms the same registration is still silent.
 */
let now = 10000;
let scheduled = null;
const closes = [];
const tunnel = {
	registeredAt: 1000,
	registrationGeneration: 7
};
const options = {
	now: () => now,
	failureThreshold: 3,
	sustainMs: 30000,
	schedule(callback, delay) {
		const timer = { callback, delay, unref() {} };
		scheduled = timer;
		return timer;
	},
	cancel() {},
	close(_client, code, reason) {
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
assert.equal(scheduled.callback(), true);
assert.equal(tunnel.acceptanceRecoveryMaturedAt, 40000);
assert.equal(tunnel.acceptanceRecoveryRequestedAt || 0, 0);
assert.equal(closes.length, 0);

assert.equal(Recovery.noteFailure(tunnel, "d", "timeout", options), 4);
assert.deepEqual(closes, [[4001, "Acceptance recovery"]]);
assert.equal(tunnel.acceptanceRecoveryRequestedAt, 40000);
Recovery.noteFailure(tunnel, "e", "timeout", options);
assert.equal(closes.length, 1);

now = 41000;
assert.equal(Recovery.noteSuccess(tunnel, options), true);
assert.equal(tunnel.acceptanceFailureCount, 0);
assert.equal(tunnel.acceptanceFailureSince, 0);
assert.equal(tunnel.acceptanceRecoveryMaturedAt, 0);
assert.equal(tunnel.acceptanceRecoveryRequestedAt, 0);
assert.equal(tunnel.acceptanceHealthy, true);

console.log("BHY acceptance recovery requires fresh post-sustain failure confirmation");
