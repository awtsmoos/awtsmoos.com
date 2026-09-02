// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Dispatch = require("./requestDispatch.js");
const State = require("./state.js");

/**
 * @file Proves reconnect redelivery preserves canonical identity and generation fences.
 * @description
 * The Awtsmoos keeps one deed through reconnecting vessels. Awtsmoos.com watches the
 * same generation, redelivers the exact envelope once to a newer generation, and never
 * resends after durable device acceptance.
 */
test("same generation watches while newer generation redelivers same envelope once", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-redelivery-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const context = { pendingTunnelRequests: new Map(), tunnelRelayStateRoot: root, tunnels: new Map() };
	const sent = [];
	const envelope = { type: "TUNNEL_REQUEST", id: "one", payload: { controlRequestId: "control-one" } };
	const record = pendingRecord(envelope);
	context.pendingTunnelRequests.set("one", record);

	const same = tunnel(4, sent);
	context.tunnels.set(same.registrationKey, same);
	assert.equal(Dispatch.recoverPending(context, same), 1);
	assert.equal(sent.length, 0);
	assert.ok(record.acceptanceTimer);
	clearTimeout(record.acceptanceTimer);

	const newer = tunnel(5, sent);
	context.tunnels.set(newer.registrationKey, newer);
	assert.equal(Dispatch.recoverPending(context, newer), 1);
	await record.recoveryPromise;
	assert.equal(sent.length, 1);
	assert.strictEqual(sent[0], envelope);
	assert.equal(record.dispatchRegistrationGeneration, 5);
	clearTimeout(record.acceptanceTimer);

	assert.equal(Dispatch.recoverPending(context, newer), 1);
	assert.equal(sent.length, 1);
	clearTimeout(record.acceptanceTimer);
	const durable = await State.hydrate(context, "one", record.expected);
	assert.equal(durable.dispatchRegistrationGeneration, 5);
});

test("accepted request never redelivers on newer generation", () => {
	const sent = [];
	const record = pendingRecord({ type: "TUNNEL_REQUEST", id: "accepted" });
	record.requestAcceptedAt = Date.now();
	const next = tunnel(8, sent);
	const context = { pendingTunnelRequests: new Map([["accepted", record]]), tunnels: new Map() };
	context.tunnels.set(next.registrationKey, next);
	assert.equal(Dispatch.recoverPending(context, next), 0);
	assert.equal(sent.length, 0);
});

function pendingRecord(dispatchEnvelope) {
	return {
		registrationKey: "account::tunnel",
		dispatchedAt: "2026-08-05T00:00:00.000Z",
		dispatchStartedAt: Date.now(),
		dispatchRegistrationGeneration: 4,
		dispatchEnvelope,
		expected: { id: dispatchEnvelope.id, registrationKey: "account::tunnel", timeoutMs: 60000 },
		activityContext: { action: "stat" },
		waiters: new Set(),
		finalizationPromise: null
	};
}

function tunnel(registrationGeneration, sent) {
	return {
		registrationKey: "account::tunnel",
		registrationGeneration,
		send(value) { sent.push(value); },
		close() {}
	};
}
