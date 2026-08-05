// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Ack = require("./requestAckHandler.js");
const Pending = require("./envelopePending.js");
const State = require("./state.js");

/** Proves only a correlated device ACK makes acceptance visible and durable. */
test("device ACK changes pending custody from dispatched to accepted", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-relay-ack-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const id = "acceptance-one";
	const expected = { id, registrationKey: "account::tunnel", requestedAction: "stat" };
	const context = { pendingTunnelRequests: new Map(), tunnelRelayStateRoot: root };
	await State.claim(context, id, expected);
	await State.rememberDispatched(context, id, expected, {
		dispatchedAt: "2026-08-05T00:00:00.000Z"
	});
	const record = {
		registrationKey: expected.registrationKey, expected,
		dispatchedAt: "2026-08-05T00:00:00.000Z", dispatchStartedAt: Date.now(),
		activityContext: { action: "stat" }, waiters: new Set()
	};
	context.pendingTunnelRequests.set(id, record);
	assert.equal(Pending.timeoutEnvelope(expected, 1, 1000, record).accepted, false);
	const client = { registrationKey: expected.registrationKey, registrationGeneration: 9 };
	assert.equal(Ack.handleTunnelRequestAck(context, client, {
		id, acceptedAt: "2026-08-05T00:00:01.000Z", durable: true
	}), true);
	assert.equal(Pending.timeoutEnvelope(expected, 1, 1000, record).accepted, true);
	await record.acceptancePersistencePromise;
	const durable = await State.hydrate({ tunnelRelayStateRoot: root }, id, expected);
	assert.equal(durable.acceptedAt, "2026-08-05T00:00:01.000Z");
	clearTimeout(record.consumerTimer);
});
