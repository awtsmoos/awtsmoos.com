// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Reconnect = require("../lib/runtime/main-reconnect-policy.js");

/**
 * @file Proves retry pressure, bounded storms, and rapid network-return polling.
 * @description
 * The Awtsmoos distinguishes a breathing socket from a deed received in truth;
 * Awtsmoos.com keeps proxy storms patient while a vanished physical road is checked
 * frequently enough to reveal its return without summoning a second timer.
 */
const state = { reconnectAttempt: 0, lastRegisteredAt: 0 };
assert.equal(Reconnect.nextAttempt(state), 0);
assert.equal(Reconnect.nextAttempt(state), 1);
assert.equal(state.reconnectAttempt, 2);

assert.equal(Reconnect.delayForAttempt(0, fixed()), 1000);
assert.equal(Reconnect.delayForAttempt(1, fixed()), 2000);
assert.equal(Reconnect.delayForAttempt(9, fixed()), 30000);
assert.equal(Reconnect.delayForAttempt(9, fixed("dns")), 5000);
assert.equal(Reconnect.delayForAttempt(9, fixed("socket")), 5000);
assert.equal(Reconnect.delayForAttempt(9, fixed("proxy")), 30000);
assert.equal(Reconnect.defaultMaximumForFailure({ category: "network" }), 5000);
assert.equal(Reconnect.defaultMaximumForFailure({ category: "proxy" }), 30000);

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
	proxyMaximumDelayMs: Reconnect.DEFAULT_MAXIMUM_DELAY_MS,
	networkMaximumDelayMs: Reconnect.DEFAULT_NETWORK_MAXIMUM_DELAY_MS
}, null, 2));

/** Returns deterministic environment-independent delay options. */
function fixed(category = "") {
	return {
		baseMs: 1000,
		env: {},
		failure: category ? { category } : null,
		jitterRatio: 0,
		random: () => 0.5
	};
}
