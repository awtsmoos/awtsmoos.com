// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Lifecycle = require("./lifecycle.js");
const ResponseHandler = require("./responseHandler.js");
const Watchdog = require("./requestDispatchWatchdog.js");

/**
 * @file Proves missing acceptance remains request-scoped across repeated failures.
 * @description
 * The Awtsmoos lets one receipt be absent without declaring the whole road gone;
 * Awtsmoos.com records every doubtful deed while the living transport carries on.
 */
test("first acceptance timeout settles only its request", async t => {
	const harness = installSettlementHarness(t);
	const tunnel = liveTunnel();
	assert.equal(await timeout(harness.context("request-one"), "request-one", tunnel), true);
	assert.equal(harness.finalData.action, "tunnelRequestAcceptanceTimedOut");
	assert.equal(harness.finalData.healthImpact, "request_only");
	assert.equal(tunnel.acceptanceFailureCount, 1);
	assert.equal(tunnel.acceptanceHealthy, false);
	assertAlive(tunnel, harness, 1);
});

test("repeated acceptance timeouts never fence a healthy socket", async t => {
	const harness = installSettlementHarness(t);
	const tunnel = liveTunnel();
	await timeout(harness.context("request-one"), "request-one", tunnel);
	await timeout(harness.context("request-two"), "request-two", tunnel);
	await timeout(harness.context("request-three"), "request-three", tunnel);
	assert.equal(tunnel.acceptanceFailureCount, 3);
	assert.equal(tunnel.acceptanceHealthy, false);
	assertAlive(tunnel, harness, 3);
});

test("successful acceptance clears prior diagnostic strike state", () => {
	const tunnel = liveTunnel();
	Watchdog.noteFailure(tunnel, "request-one", "device_request_acceptance_timeout");
	Watchdog.noteFailure(tunnel, "request-two", "device_request_acceptance_timeout");
	assert.equal(tunnel.acceptanceFailureCount, 2);
	assert.equal(Watchdog.noteSuccess(tunnel), true);
	assert.equal(tunnel.acceptanceFailureCount, 0);
	assert.equal(tunnel.acceptanceHealthy, true);
	assert.equal(tunnel.lastAcceptanceFailureId, "");
	assert.equal(tunnel.connected, true);
	assert.equal(tunnel.closeCalls, 0);
});

function installSettlementHarness(t) {
	const originalFinish = Lifecycle.finishPending;
	const originalAcknowledge = ResponseHandler.acknowledge;
	const harness = { finalData: null, settlementAcks: 0 };
	Lifecycle.finishPending = async (context, id, record, data) => {
		harness.finalData = data;
		context.pendingTunnelRequests.delete(id);
		return true;
	};
	ResponseHandler.acknowledge = () => {
		harness.settlementAcks += 1;
		return true;
	};
	t.after(() => {
		Lifecycle.finishPending = originalFinish;
		ResponseHandler.acknowledge = originalAcknowledge;
	});
	harness.context = id => ({ pendingTunnelRequests: new Map([[id, record(id)]]) });
	return harness;
}

function assertAlive(tunnel, harness, expectedAcks) {
	assert.equal(tunnel.connected, true);
	assert.equal(tunnel.isAlive, true);
	assert.equal(tunnel.closeCalls, 0);
	assert.equal(harness.settlementAcks, expectedAcks);
}

function timeout(context, id, tunnel) {
	return Watchdog.acceptanceTimeout(context, id, context.pendingTunnelRequests.get(id), tunnel);
}

function record(id) {
	return { expected: { id, requestedAction: "stat" } };
}

function liveTunnel() {
	return {
		connected: true,
		isAlive: true,
		closeCalls: 0,
		close() {
			this.closeCalls += 1;
		}
	};
}
