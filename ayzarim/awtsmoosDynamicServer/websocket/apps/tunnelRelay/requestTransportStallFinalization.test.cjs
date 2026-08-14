// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Ack = require("./requestAckHandler.js");
const Dispatch = require("./requestDispatch.js");
const State = require("./state.js");

test("acceptance timeout becomes terminal before the tunnel is fenced", async t => {
	const fixture = context(t);
	const record = pending(fixture, "acceptance-request");
	const transport = connection();
	await Dispatch.finishStalledRequest(
		fixture,
		"acceptance-request",
		record,
		"device_request_acceptance_timeout",
		transport
	);
	assert.equal(fixture.pendingTunnelRequests.has("acceptance-request"), false);
	const durable = await State.hydrate(fixture, "acceptance-request", record.expected);
	assert.equal(durable.state, "failed");
	assert.equal(durable.data.terminal, true);
	assert.equal(durable.data.accepted, null);
	assert.equal(durable.data.error, "device_request_acceptance_timeout");
	assert.equal(transport.sent[0].transportReceiptId, "acceptance-request");
});

test("consumer timeout ends canonical work and releases device custody", async t => {
	const fixture = context(t);
	const record = pending(fixture, "consumer-request");
	const transport = connection();
	await Ack.finishStalledRequest(
		fixture,
		"consumer-request",
		record,
		"device_consumer_progress_timeout",
		transport
	);
	assert.equal(fixture.pendingTunnelRequests.has("consumer-request"), false);
	const durable = await State.hydrate(fixture, "consumer-request", record.expected);
	assert.equal(durable.state, "failed");
	assert.equal(durable.data.terminal, true);
	assert.equal(durable.data.accepted, true);
	assert.equal(durable.data.retryable, false);
	assert.equal(durable.data.error, "device_consumer_progress_timeout");
	assert.equal(transport.sent[0].transportReceiptId, "consumer-request");
});

function connection() {
	return {
		sent: [],
		send(value) {
			this.sent.push(value);
			return true;
		}
	};
}

function context(t) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-stall-finalization-"));
	t.after(() => fs.rmSync(root, { force: true, recursive: true }));
	return { pendingTunnelRequests: new Map(), tunnelRelayStateRoot: root };
}

function pending(fixture, id) {
	const record = {
		activityContext: { action: "stat" },
		acceptanceTimer: null,
		consumerTimer: null,
		expiryTimer: null,
		expected: {
			controlRequestId: id,
			id,
			registrationKey: "account::tunnel",
			requestedAction: "stat",
			timeoutMs: 240000,
			tunnelName: "awt-test"
		},
		finalizationPromise: null,
		waiters: new Set()
	};
	fixture.pendingTunnelRequests.set(id, record);
	return record;
}
