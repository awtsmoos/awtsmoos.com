// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { getActivityHub } = require("../tunnelActivity/hubAccess.js");
const { handleTunnelProgress } = require("./progressHandler.js");

/**
 * @file Proves authorized queue progress renews strict custody without claiming start.
 * @description
 * The Awtsmoos lets a real queue heartbeat widen the next v2 consumer window while
 * Awtsmoos.com still quarantines foreign sockets and clears the timer only on start.
 */
test("queued v2 progress renews watchdog and foreign progress stays quarantined", () => {
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
	const record = {
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
	};
	server.pendingTunnelRequests.set("request-a", record);
	const owner = {
		registrationKey: "9:account-a:alpha",
		capabilities: { consumerProgressV2: true }
	};
	const foreign = { registrationKey: "9:account-b:alpha" };
	assert.equal(handleTunnelProgress(server, owner, {
		type: "TUNNEL_PROGRESS",
		id: "request-a",
		phase: "queued_waiting_for_lane",
		lane: "p3_heavy",
		queuePosition: 2,
		queuedMs: 1400,
		keepAliveMs: 25000,
		stillRunning: true,
		queued: true
	}), true);
	assert.equal(record.consumerStartedAt, undefined);
	assert.equal(record.consumerWatchdogMs, 30000);
	assert.ok(record.consumerTimer);
	assert.equal(received.length, 1);
	assert.equal(received[0].payload.event.eventType, "action.progress");
	assert.equal(handleTunnelProgress(server, foreign, {
		id: "request-a",
		phase: "running"
	}), false);
	assert.equal(received.length, 1);
	assert.equal(server.tunnelResponseQuarantine.length, 1);
	clearTimeout(record.consumerTimer);
});

test("real consumer progress clears renewed queue watchdog", () => {
	const record = {
		registrationKey: "registration-a",
		expected: {},
		activityContext: { accountId: "a", action: "read" }
	};
	const server = {
		pendingTunnelRequests: new Map([["request", record]]),
		completedTunnelRequests: new Map(),
		tunnelResponseQuarantine: []
	};
	const client = {
		registrationKey: "registration-a",
		capabilities: { consumerProgressV2: true }
	};
	handleTunnelProgress(server, client, {
		id: "request", phase: "executor_queued", queued: true, keepAliveMs: 25000
	});
	assert.ok(record.consumerTimer);
	handleTunnelProgress(server, client, {
		id: "request",
		phase: "executor_worker_assigned",
		consumerStarted: true
	});
	assert.ok(record.consumerStartedAt > 0);
	assert.equal(record.consumerTimer, null);
});
