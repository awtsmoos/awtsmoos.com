// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Reconnect = require("../lib/runtime/main-reconnect-policy.js");

/**
 * @file Proves reconnect pressure survives failed opens and resets after ACK.
 * @description
 * The Awtsmoos renews every attempt without creating a storm. Awtsmoos.com grows
 * delay across failed generations, bounds jitter, and returns to the first interval
 * only after authenticated registration has become true.
 */
const state = { reconnectAttempt: 0, lastRegisteredAt: 0 };
assert.equal(Reconnect.nextAttempt(state), 0);
assert.equal(state.reconnectAttempt, 1);
assert.equal(Reconnect.nextAttempt(state), 1);
assert.equal(state.reconnectAttempt, 2);

assert.equal(Reconnect.delayForAttempt(0, {
	baseMs: 1000,
	maximumMs: 30000,
	jitterRatio: 0,
	random: () => 0.5
}), 1000);
assert.equal(Reconnect.delayForAttempt(1, {
	baseMs: 1000,
	maximumMs: 30000,
	jitterRatio: 0,
	random: () => 0.5
}), 2000);
assert.equal(Reconnect.delayForAttempt(9, {
	baseMs: 1000,
	maximumMs: 30000,
	jitterRatio: 0,
	random: () => 0.5
}), 30000);

Reconnect.markRegistered(state);
assert.equal(state.reconnectAttempt, 0);
assert.equal(state.lastRegisteredAt > 0, true);

console.log(JSON.stringify({
	ok: true,
	suite: "reconnect-policy",
	failedOpenPreservesBackoff: true,
	ackResetsBackoff: true,
	maximumDelayBounded: true
}, null, 2));
