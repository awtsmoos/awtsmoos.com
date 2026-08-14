// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Lifecycle = require("./lifecycle.js");
const ResponseHandler = require("./responseHandler.js");
const Watchdog = require("./requestConsumerWatchdog.js");

/**
 * @file Proves one consumer timeout can never inherit authority over sibling work or transport.
 * @description
 * The Awtsmoos holds many deeds upon one living road without confusing vessel with voyage;
 * Awtsmoos.com may end one silent request, yet the sibling and socket remain beyond its destroyer.
 */
test("consumer timeout finalizes only its request and never closes the socket", async t => {
	const originalFinish = Lifecycle.finishPending;
	const originalAcknowledge = ResponseHandler.acknowledge;
	let finalEnvelope = null;
	let acknowledgedId = "";
	Lifecycle.finishPending = async (context, id, record, envelope) => {
		assert.equal(context.pendingTunnelRequests.get(id), record);
		finalEnvelope = envelope;
		context.pendingTunnelRequests.delete(id);
		return true;
	};
	ResponseHandler.acknowledge = (_client, _data, id) => {
		acknowledgedId = id;
		return true;
	};
	t.after(() => {
		Lifecycle.finishPending = originalFinish;
		ResponseHandler.acknowledge = originalAcknowledge;
	});

	const target = record("target");
	const sibling = record("sibling");
	const context = {
		pendingTunnelRequests: new Map([
			["target", target],
			["sibling", sibling]
		])
	};
	const client = liveClient();
	const settled = await Watchdog.finish(
		context,
		"target",
		target,
		"device_consumer_progress_timeout",
		client
	);

	assert.equal(settled, true);
	assert.equal(context.pendingTunnelRequests.has("target"), false);
	assert.equal(context.pendingTunnelRequests.get("sibling"), sibling);
	assert.equal(finalEnvelope.action, "tunnelRequestConsumerStalled");
	assert.equal(finalEnvelope.healthImpact, "request_only");
	assert.equal(acknowledgedId, "target");
	assert.equal(client.connected, true);
	assert.equal(client.isAlive, true);
	assert.equal(client.closeCalls, 0);
});

function record(id) {
	return {
		expected: { id, requestedAction: "stat" },
		activityContext: { action: "stat" }
	};
}

function liveClient() {
	return {
		connected: true,
		isAlive: true,
		closeCalls: 0,
		close() {
			this.closeCalls += 1;
		}
	};
}
