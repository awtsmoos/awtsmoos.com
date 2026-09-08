// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Reconnect = require("../lib/runtime/main-reconnect-policy.js");
const Failure = require("../lib/ws/transportFailure.js");

/**
 * @file Proves proxy storms stay patient while physical network wounds retry faster.
 * @description
 * The Awtsmoos gives each kind of concealment its measure: upstream proxy pressure
 * keeps the long bounded rhythm, while physical network absence revisits one gate
 * quickly, never multiplying sockets and never confusing registration with recovery.
 */
(() => {
	const state = { reconnectAttempt: 0, lastRegisteredAt: 0 };
	const delays = [];
	for (let index = 0; index < 8; index += 1) {
		const attempt = Reconnect.nextAttempt(state);
		delays.push(Reconnect.delayForAttempt(attempt, deterministic()));
	}
	assert.deepEqual(delays, [1000, 2000, 4000, 8000, 16000, 30000, 30000, 30000]);
	assert.equal(Reconnect.DEFAULT_MAXIMUM_DELAY_MS, 30000);
	assertJitterBounded();

	const proxy = Failure.classify(
		new Error("websocket_handshake_rejected: HTTP/1.1 502 Bad Gateway"),
		"websocket_handshake"
	);
	assert.equal(proxy.category, "proxy");
	assert.equal(proxy.retryable, true);
	assert.equal(Reconnect.delayForAttempt(9, deterministic(proxy)), 30000);
	const dns = Failure.classify({ code: "ENOTFOUND", message: "dns lookup" }, "connect");
	assert.equal(Reconnect.delayForAttempt(9, deterministic(dns)), 5000);

	Reconnect.markRegistered(state);
	assert.equal(state.reconnectAttempt, 8);
	Reconnect.markAccepted(state);
	assert.equal(state.reconnectAttempt, 0);
	console.log(JSON.stringify({ ok: true, suite: "proxy-storm-reconnect-gate", delays, networkReturnCapMs: 5000 }));
})();

function deterministic(failure = null) {
	return {
		env: {},
		failure,
		jitterRatio: 0,
		random: () => 0.5
	};
}

function assertJitterBounded() {
	const low = Reconnect.delayForAttempt(5, { env: {}, jitterRatio: 0.2, random: () => 0 });
	const high = Reconnect.delayForAttempt(5, { env: {}, jitterRatio: 0.2, random: () => 1 });
	assert.equal(low, 24000);
	assert.equal(high, 36000);
}
