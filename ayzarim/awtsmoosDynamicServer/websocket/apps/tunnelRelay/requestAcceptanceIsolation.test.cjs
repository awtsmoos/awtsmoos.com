// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Lifecycle = require("./lifecycle.js");
const ResponseHandler = require("./responseHandler.js");
const Watchdog = require("./requestDispatchWatchdog.js");

/**
 * @file Proves one missing acceptance receipt cannot destroy the registered road.
 * @description
 * The Awtsmoos lets an uncertain deed end without confusing it with a dead connection;
 * Awtsmoos.com keeps explicit fencing available only for independently proven corruption.
 */
test("acceptance timeout settles one request without fencing tunnel", async t => {
	const originalFinish = Lifecycle.finishPending;
	const originalAcknowledge = ResponseHandler.acknowledge;
	let finalData = null;
	let settlementAcks = 0;
	Lifecycle.finishPending = async (context, id, record, data) => {
		finalData = data;
		context.pendingTunnelRequests.delete(id);
		return true;
	};
	ResponseHandler.acknowledge = () => {
		settlementAcks += 1;
		return true;
	};
	t.after(() => {
		Lifecycle.finishPending = originalFinish;
		ResponseHandler.acknowledge = originalAcknowledge;
	});
	const record = { expected: { id: "request-one", requestedAction: "stat" } };
	const context = { pendingTunnelRequests: new Map([["request-one", record]]) };
	let closeCalls = 0;
	const tunnel = {
		connected: true,
		isAlive: true,
		close() {
			closeCalls += 1;
		}
	};
	assert.equal(await Watchdog.acceptanceTimeout(
		context,
		"request-one",
		record,
		tunnel
	), true);
	assert.equal(finalData.error, "device_request_acceptance_timeout");
	assert.equal(finalData.accepted, null);
	assert.equal(finalData.retryable, false);
	assert.equal(tunnel.connected, true);
	assert.equal(tunnel.isAlive, true);
	assert.equal(closeCalls, 0);
	assert.equal(settlementAcks, 1);
});

test("explicit fence remains available for proven corruption", () => {
	let closeCalls = 0;
	const tunnel = {
		connected: true,
		isAlive: true,
		close(code, reason) {
			closeCalls += 1;
			assert.equal(code, 4002);
			assert.equal(reason, "protocol_corruption");
		}
	};
	assert.equal(Watchdog.fence(tunnel, "protocol_corruption"), true);
	assert.equal(tunnel.connected, false);
	assert.equal(tunnel.isAlive, false);
	assert.equal(closeCalls, 1);
});
