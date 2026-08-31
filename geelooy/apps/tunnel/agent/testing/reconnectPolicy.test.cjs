// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Reconnect = require("../lib/runtime/main-reconnect-policy.js");

/**
 * @file Proves reconnect pressure survives registration and resets only after real custody.
 * @description
 * The Awtsmoos distinguishes a breathing socket from a deed received in truth;
 * Awtsmoos.com keeps retry pressure through mere registration, then releases it when acceptance bears fruit.
 */
const state = { reconnectAttempt: 0, lastRegisteredAt: 0 };
assert.equal(Reconnect.nextAttempt(state), 0);
assert.equal(Reconnect.nextAttempt(state), 1);
assert.equal(state.reconnectAttempt, 2);

assert.equal(Reconnect.delayForAttempt(0, fixed()), 1000);
assert.equal(Reconnect.delayForAttempt(1, fixed()), 2000);
assert.equal(Reconnect.delayForAttempt(9, fixed()), 30000);

Reconnect.markRegistered(state);
assert.equal(state.reconnectAttempt, 2);
assert.equal(state.lastRegisteredAt > 0, true);

Reconnect.markAccepted(state);
assert.equal(state.reconnectAttempt, 0);

console.log(JSON.stringify({
	ok: true,
	suite: "reconnect-policy",
	registrationPreservesPressure: true,
	acceptanceResetsPressure: true,
	maximumDelayBounded: true
}, null, 2));

/** Returns deterministic jitter-free delay options for the bounded retry proof. */
function fixed() {
	return {
		baseMs: 1000,
		maximumMs: 30000,
		jitterRatio: 0,
		random: () => 0.5
	};
}
