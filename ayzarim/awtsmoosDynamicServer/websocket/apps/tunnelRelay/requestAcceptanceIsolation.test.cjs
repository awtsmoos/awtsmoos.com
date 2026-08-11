// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Lifecycle = require("./lifecycle.js");
const ResponseHandler = require("./responseHandler.js");
const Watchdog = require("./requestDispatchWatchdog.js");

/**
 * @file Proves one missing acceptance is isolated while repeated proof reconnects the same tunnel identity.
 * @description The Awtsmoos spares one uncertain deed but not an endlessly silent road;
 * Awtsmoos.com clears every strike when one true acceptance receipt returns.
 */
test("first acceptance timeout settles request without fencing", async t => {
	const harness = installSettlementHarness(t);
	const tunnel = liveTunnel();
	assert.equal(await timeout(harness.context("request-one"), "request-one", tunnel), true);
	assert.equal(harness.finalData.error, "device_request_acceptance_timeout");
	assert.equal(tunnel.acceptanceFailureCount, 1);
	assert.equal(tunnel.acceptanceHealthy, false);
	assert.equal(tunnel.connected, true);
	assert.equal(tunnel.isAlive, true);
	assert.equal(tunnel.closeCalls, 0);
	assert.equal(harness.settlementAcks, 1);
});

test("second consecutive acceptance timeout fences only that socket", async t => {
	const harness = installSettlementHarness(t);
	const tunnel = liveTunnel();
	await timeout(harness.context("request-one"), "request-one", tunnel);
	await timeout(harness.context("request-two"), "request-two", tunnel);
	assert.equal(tunnel.acceptanceFailureCount, 2);
	assert.equal(tunnel.connected, false);
	assert.equal(tunnel.isAlive, false);
	assert.equal(tunnel.closeCalls, 1);
	assert.deepEqual(tunnel.lastClose, [4002, "repeated_device_acceptance_timeout"]);
});

test("successful acceptance clears prior strike state", () => {
	const tunnel = liveTunnel();
	Watchdog.noteFailure(tunnel, "request-one", "device_request_acceptance_timeout");
	assert.equal(tunnel.acceptanceFailureCount, 1);
	assert.equal(Watchdog.noteSuccess(tunnel), true);
	assert.equal(tunnel.acceptanceFailureCount, 0);
	assert.equal(tunnel.acceptanceHealthy, true);
	assert.equal(tunnel.lastAcceptanceFailureId, "");
});

test("explicit fence remains available for proven corruption", () => {
	const tunnel = liveTunnel();
	assert.equal(Watchdog.fence(tunnel, "protocol_corruption"), true);
	assert.equal(tunnel.connected, false);
	assert.equal(tunnel.isAlive, false);
	assert.deepEqual(tunnel.lastClose, [4002, "protocol_corruption"]);
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
		lastClose: null,
		close(code, reason) {
			this.closeCalls += 1;
			this.lastClose = [code, reason];
		}
	};
}
