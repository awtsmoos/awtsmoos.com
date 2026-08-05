// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Dispatch = require("./requestDispatch.js");

/** Proves reconnect observes an uncertain prior dispatch instead of replaying it. */
test("reconnect never resends a request whose dispatch already began", t => {
	const context = { pendingTunnelRequests: new Map() };
	const sent = [];
	const tunnel = {
		registrationKey: "account::tunnel",
		send(value) { sent.push(value); },
		close() {}
	};
	const record = {
		registrationKey: tunnel.registrationKey,
		dispatchedAt: "2026-08-05T00:00:00.000Z",
		dispatchStartedAt: Date.now(),
		dispatchEnvelope: { type: "TUNNEL_REQUEST", id: "one" },
		expected: { requestedAction: "stat" },
		activityContext: { action: "stat" },
		waiters: new Set(), finalizationPromise: null
	};
	context.pendingTunnelRequests.set("one", record);
	assert.equal(Dispatch.recoverPending(context, tunnel), 1);
	assert.equal(sent.length, 0);
	assert.ok(record.acceptanceTimer);
	t.after(() => clearTimeout(record.acceptanceTimer));
});
