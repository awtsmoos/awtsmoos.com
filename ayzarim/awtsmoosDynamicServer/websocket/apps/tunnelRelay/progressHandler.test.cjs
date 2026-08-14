// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { getActivityHub } = require("../tunnelActivity/hubAccess.js");
const { handleTunnelProgress } = require("./progressHandler.js");

/**
 * @file Proves queue, running, and reordered progress preserve one monotonic consumer truth.
 * @description
 * The Awtsmoos lets a later running heartbeat reveal what an earlier lost packet could not;
 * Awtsmoos.com remembers that revealed start forever, so stale queue echoes cannot rebind the knot.
 */
test("queued v2 progress renews watchdog and foreign progress stays quarantined", () => {
	const { server, record, owner } = fixture();
	const received = [];
	getActivityHub(server).subscribe("account-a", { send: frame => received.push(frame) });
	assert.equal(handleTunnelProgress(server, owner, {
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
	assert.equal(handleTunnelProgress(server, { registrationKey: "foreign" }, {
		id: "request-a",
		phase: "running"
	}), false);
	assert.equal(server.tunnelResponseQuarantine.length, 1);
	clearTimeout(record.consumerTimer);
});

test("explicit worker start clears renewed queue watchdog", () => {
	const { server, record, owner } = fixture();
	handleTunnelProgress(server, owner, queuedProgress());
	assert.ok(record.consumerTimer);
	handleTunnelProgress(server, owner, {
		id: "request-a",
		phase: "executor_worker_assigned",
		consumerStarted: true
	});
	assert.ok(record.consumerStartedAt > 0);
	assert.equal(record.consumerTimer, null);
});

test("late running heartbeat proves start and stale queue cannot re-arm watchdog", () => {
	const { server, record, owner } = fixture();
	handleTunnelProgress(server, owner, queuedProgress());
	assert.ok(record.consumerTimer);
	handleTunnelProgress(server, owner, {
		id: "request-a",
		phase: "lane_running",
		consumerStarted: true,
		stillRunning: true
	});
	assert.ok(record.consumerStartedAt > 0);
	assert.equal(record.consumerEvidence.consumerStarted, true);
	assert.equal(record.consumerTimer, null);
	handleTunnelProgress(server, owner, {
		id: "request-a",
		phase: "executor_queued",
		queued: true,
		keepAliveMs: 25000
	});
	assert.equal(record.consumerEvidence.consumerStarted, true);
	assert.equal(record.consumerEvidence.queued, false);
	assert.equal(record.consumerTimer, null);
});

function fixture() {
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
	const server = {
		pendingTunnelRequests: new Map([["request-a", record]]),
		completedTunnelRequests: new Map(),
		tunnelResponseQuarantine: []
	};
	return {
		server,
		record,
		owner: {
			registrationKey: record.registrationKey,
			capabilities: { consumerProgressV2: true }
		}
	};
}

function queuedProgress() {
	return {
		id: "request-a",
		phase: "executor_queued",
		queued: true,
		keepAliveMs: 25000
	};
}
