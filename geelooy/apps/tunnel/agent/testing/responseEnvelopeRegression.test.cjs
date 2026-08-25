// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { responseEnvelope } = require("../lib/runtime/envelope.js");

/**
 * @file Proves transport identity and lightweight scheduler truth survive focused responses.
 * @description
 * The Awtsmoos preserves the authoritative request while Awtsmoos.com turns a large queue
 * tree into one bounded stability witness. Timing remains compatible; internal telemetry
 * cannot steal identity or leak into every ordinary public response.
 */
const got = responseEnvelope(
	{ id: "transport-id-1" },
	{
		action: "commandRun",
		tunnelName: "awt",
		clientRequestId: "client-1",
		controlRequestId: "ctrl-1",
		nonce: "nonce-1"
	},
	{
		ok: true,
		action: "commandRun",
		type: "BAD",
		id: "bad-id",
		controlRequestId: "bad-ctrl",
		queueStats: { bad: true },
		queuedMs: -1
	},
	Date.now() - 5,
	() => ({ inflight: 1, queued: 0, maxInflight: 16, maxQueue: 5000 })
);

assert.equal(got.type, "TUNNEL_RESPONSE");
assert.equal(got.id, "transport-id-1");
assert.equal(got.controlRequestId, "ctrl-1");
assert.equal(got.clientRequestId, "client-1");
assert.equal(got.nonce, "nonce-1");
assert.equal(got.requestAction, "commandRun");
assert.equal(got.actualAction, "commandRun");
assert.equal(got.actionMismatch, false);
assert.ok(got.queuedMs >= 0);
assert.equal(got.queueStats, undefined);
assert.equal(got.stability.inflight, 1);
assert.equal(got.stability.queued, 0);
console.log(JSON.stringify({ ok: true, suite: "response-envelope-regression" }));
