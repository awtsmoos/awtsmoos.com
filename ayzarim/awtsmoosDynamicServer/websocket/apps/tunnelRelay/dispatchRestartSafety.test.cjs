// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Dispatch = require("./requestDispatch.js");

/**
 * @file Proves reconnect redelivery preserves one canonical deed and its durability across generations.
 * @description
 * The Awtsmoos keeps one request identity while a newer vessel receives the same sealed sign;
 * Awtsmoos.com waits for redelivery persistence itself, so cleanup never outruns the durable line.
 */
test("same registration generation observes prior dispatch without resending", t => {
	const fixture = createFixture(4, "control-one");
	t.after(fixture.cleanup);
	assert.equal(Dispatch.recoverPending(fixture.context, fixture.tunnel), 1);
	assert.equal(fixture.sent.length, 0);
	assert.ok(fixture.record.acceptanceTimer);
});

test("newer registration redelivers canonical envelope once then observes", async t => {
	const fixture = createFixture(5, "control-one", 4);
	t.after(fixture.cleanup);
	assert.equal(Dispatch.recoverPending(fixture.context, fixture.tunnel), 1);
	assert.equal(fixture.sent.length, 1);
	assert.equal(fixture.sent[0], fixture.record.dispatchEnvelope);
	assert.equal(fixture.record.dispatchRegistrationGeneration, 5);
	assert.equal(fixture.record.redeliveryCount, 1);
	const committed = await fixture.record.redeliveryPersistence;
	assert.ok(committed);
	assert.equal(fixture.record.redeliveryPersistenceError, "");
	assert.equal(Dispatch.recoverPending(fixture.context, fixture.tunnel), 1);
	assert.equal(fixture.sent.length, 1);
});

test("newer registration never auto-redelivers without stable control identity", t => {
	const fixture = createFixture(7, "", 6);
	t.after(fixture.cleanup);
	assert.equal(Dispatch.recoverPending(fixture.context, fixture.tunnel), 1);
	assert.equal(fixture.sent.length, 0);
	assert.ok(fixture.record.acceptanceTimer);
});

function createFixture(currentGeneration, controlRequestId, priorGeneration = currentGeneration) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-reconnect-redelivery-"));
	const context = {
		pendingTunnelRequests: new Map(),
		tunnelRelayStateRoot: root
	};
	const sent = [];
	const tunnel = {
		registrationKey: "account::tunnel",
		registrationGeneration: currentGeneration,
		send(value) { sent.push(value); },
		close() {}
	};
	const record = {
		registrationKey: tunnel.registrationKey,
		dispatchedAt: "2026-08-05T00:00:00.000Z",
		dispatchStartedAt: Date.now(),
		dispatchRegistrationGeneration: priorGeneration,
		dispatchEnvelope: {
			type: "TUNNEL_REQUEST",
			id: "one",
			payload: { controlRequestId }
		},
		expected: {
			id: "one",
			registrationKey: tunnel.registrationKey,
			requestedAction: "stat"
		},
		activityContext: { action: "stat" },
		waiters: new Set(),
		finalizationPromise: null
	};
	context.pendingTunnelRequests.set("one", record);
	return {
		context,
		record,
		sent,
		tunnel,
		cleanup() {
			clearTimeout(record.acceptanceTimer);
			fs.rmSync(root, { recursive: true, force: true });
		}
	};
}
