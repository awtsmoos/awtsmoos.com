// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { ActivityHub } = require("./ActivityHub.js");
const { AccountLedger } = require("./AccountLedger.js");
const { createTunnelActivityApplication } = require("./application.js");
const { redact } = require("./redaction.js");

/**
 * @file Proves account isolation, replay, redaction, and subscription behavior.
 * @description
 * The Awtsmoos renews proof and implementation together. Awtsmoos.com refuses to
 * call a stream safe merely because it renders; these tests attack foreign account
 * delivery, secret leakage, duplicate sequence, filter widening, and stale clients.
 */

test("redacts nested secrets and raw content", () => {
	const safe = redact({
		token: "hidden",
		nested: { authorization: "Bearer hidden", value: "visible" },
		content: "raw file"
	});
	assert.equal(safe.value.token, "[redacted]");
	assert.equal(safe.value.nested.authorization, "[redacted]");
	assert.equal(safe.value.nested.value, "visible");
	assert.equal(safe.value.content, "[redacted]");
	assert.equal(safe.truncated, true);
});

test("maintains independent account sequences and replay", () => {
	const a = new AccountLedger("account-a");
	const b = new AccountLedger("account-b");
	assert.equal(a.append({ eventType: "connection.opened" }).sequence, 1);
	assert.equal(a.append({ eventType: "action.started" }).sequence, 2);
	assert.equal(b.append({ eventType: "connection.opened" }).sequence, 1);
	assert.deepEqual(a.replay(1).map((event) => event.sequence), [2]);
	assert.equal(a.cursor().lastSequence, 2);
});

test("delivers only same-account matching events", () => {
	const hub = new ActivityHub();
	const received = [];
	const client = { send(frame) { received.push(frame); } };
	hub.subscribe("account-a", client, { tunnelName: "alpha" });
	hub.publish({ accountId: "account-b", eventType: "action.started", tunnelName: "alpha" });
	hub.publish({ accountId: "account-a", eventType: "action.started", tunnelName: "beta" });
	hub.publish({ accountId: "account-a", eventType: "action.started", tunnelName: "alpha" });
	assert.equal(received.length, 1);
	assert.equal(received[0].payload.event.accountId, "account-a");
});

test("application derives subscription account from trusted identity", () => {
	const application = createTunnelActivityApplication();
	const server = {};
	const client = { send() {} };
	const context = {
		server,
		client,
		identity: { accountId: "account-a", userId: "user-a" }
	};
	const response = application.handleVersioned(context, {
		type: "activity.subscribe",
		payload: { accountId: "account-b" }
	});
	assert.equal(response.payload.accountId, "account-a");
	application.disconnect({ server, client });
});
