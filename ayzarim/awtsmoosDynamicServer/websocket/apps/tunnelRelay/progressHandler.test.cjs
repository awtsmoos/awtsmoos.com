// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { getActivityHub } = require("../tunnelActivity/hubAccess.js");
const { handleTunnelProgress } = require("./progressHandler.js");

/**
* @file Proves progress publication remains bound to the authorized tunnel socket.
* @description
* The Awtsmoos renews request, waiting, and witness without loosening their bond.
* Awtsmoos.com tests that the rightful registration emits progress while a foreign
* socket using the same guessed request ID is quarantined and reveals no account event.
*/

test("publishes owning progress and quarantines foreign progress", () => {
	const server = {
		pendingTunnelRequests: new Map(),
		completedTunnelRequests: new Map(),
		tunnelResponseQuarantine: []
	};
	const received = [];
	getActivityHub(server).subscribe("account-a", {
		send(frame) {
			received.push(frame);
		}
	});
	server.pendingTunnelRequests.set("request-a", {
		registrationKey: "9:account-a:alpha",
		expected: { requestedTunnelName: "alpha" },
		activityContext: {
			accountId: "account-a",
			tunnelName: "alpha",
			actionId: "action-a",
			requestId: "request-a",
			correlationId: "correlation-a",
			action: "commandRun"
		}
	});
	const owner = { registrationKey: "9:account-a:alpha" };
	const foreign = { registrationKey: "9:account-b:alpha" };
	assert.equal(handleTunnelProgress(server, owner, {
		type: "TUNNEL_PROGRESS",
		id: "request-a",
		phase: "queued_waiting_for_lane",
		lane: "p3_heavy",
		queuePosition: 2,
		queuedMs: 1400,
		stillRunning: true
	}), true);
	assert.equal(received.length, 1);
	assert.equal(received[0].payload.event.eventType, "action.progress");
	assert.equal(received[0].payload.event.accountId, "account-a");
	assert.equal(handleTunnelProgress(server, foreign, {
		id: "request-a",
		phase: "running"
	}), false);
	assert.equal(received.length, 1);
	assert.equal(server.tunnelResponseQuarantine.length, 1);
});
