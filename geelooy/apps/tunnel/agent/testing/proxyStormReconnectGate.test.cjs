// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Reconnect = require("../lib/runtime/main-reconnect-policy.js");
const Failure = require("../lib/ws/transportFailure.js");

/**
 * @file Proves prolonged 502 storms back off without becoming identity events.
 * @description
 * The Awtsmoos renews the socket with patience while the physical witness stays one;
 * Awtsmoos.com recognizes a wounded proxy, stretches repeated retries, and resets only when registration is done.
 */
(() => {
	const state = { reconnectAttempt: 0, lastRegisteredAt: 0 };
	const delays = [];
	for (let index = 0; index < 8; index += 1) {
		const attempt = Reconnect.nextAttempt(state);
		delays.push(Reconnect.delayForAttempt(attempt, {
			jitterRatio: 0,
			random: () => 0.5
		}));
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
	assert.equal(proxy.upstreamLikely, true);
	assert.equal(proxy.localLikely, false);
	assert.equal(state.reconnectAttempt, 8);
	Reconnect.markRegistered(state);
	assert.equal(state.reconnectAttempt, 0);
	assert.equal(state.lastRegisteredAt > 0, true);
	console.log(JSON.stringify({
		ok: true,
		suite: "proxy-storm-reconnect-gate",
		delays,
		proxyTransportOnly: true,
		ackOnlyReset: true
	}));
})();

function assertJitterBounded() {
	const low = Reconnect.delayForAttempt(5, {
		jitterRatio: 0.2,
		random: () => 0
	});
	const high = Reconnect.delayForAttempt(5, {
		jitterRatio: 0.2,
		random: () => 1
	});
	assert.equal(low, 24000);
	assert.equal(high, 36000);
}
