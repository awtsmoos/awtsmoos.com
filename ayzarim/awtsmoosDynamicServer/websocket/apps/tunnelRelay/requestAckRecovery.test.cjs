// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Ack = require("./requestAckHandler.js");
const Progress = require("./progressHandler.js");
const Dispatch = require("./requestDispatch.js");

/**
 * @file Proves durable ACK recovery with strict v2 queue and consumer-progress testimony.
 * @description The Awtsmoos distinguishes accepted custody, queued waiting, and true execution;
 * Awtsmoos.com keeps the watchdog alive through queue testimony and releases it only when consumption begins.
 */
const transitions = [];
const context = {
	pendingTunnelRequests: new Map(),
	tunnelResponseQuarantine: []
};
const client = {
	registrationGeneration: 7,
	registrationKey: "account::tunnel",
	capabilities: { consumerProgressV2: true }
};
const record = {
	activityContext: { action: "stat" },
	expected: { registrationKey: client.registrationKey },
	registrationKey: client.registrationKey,
	waiters: new Set()
};
context.pendingTunnelRequests.set("request-one", record);
assert.equal(Ack.handleTunnelRequestAck(context, client, {
	type: "TUNNEL_REQUEST_ACK",
	id: "request-one",
	durable: true
}), true);
assert.ok(record.requestAcceptedAt > 0);
assert.equal(record.acceptedRegistrationGeneration, 7);
assert.ok(record.consumerTimer);
const initialTimer = record.consumerTimer;
assert.equal(Progress.handleTunnelProgress(context, client, {
	type: "TUNNEL_PROGRESS",
	id: "request-one",
	phase: "queued_waiting_for_lane",
	queued: true
}), true);
assert.ok(record.consumerTimer);
assert.notEqual(record.consumerTimer, initialTimer);
assert.equal(record.consumerStartedAt, undefined);
assert.ok(record.lastProgressAt >= record.requestAcceptedAt);
assert.equal(Progress.handleTunnelProgress(context, client, {
	type: "TUNNEL_PROGRESS",
	id: "request-one",
	phase: "executor_worker_assigned",
	consumerStarted: true
}), true);
assert.equal(record.consumerTimer, null);
assert.ok(record.consumerStartedAt >= record.requestAcceptedAt);
assert.equal(Ack.handleTunnelRequestAck(context, {
	registrationKey: "foreign",
	capabilities: { consumerProgressV2: true }
}, { id: "request-one" }), false);
assert.equal(context.tunnelResponseQuarantine.length, 1);

const sent = [];
const reconnect = {
	registrationKey: client.registrationKey,
	capabilities: { consumerProgressV2: true },
	send(envelope) { sent.push(envelope); }
};
record.dispatchEnvelope = { type: "TUNNEL_REQUEST", id: "request-one" };
record.consumerStartedAt = null;
assert.equal(Dispatch.recoverPending(context, reconnect), 0);
assert.equal(sent.length, 0);
assert.equal(Ack.monitorAccepted(context, reconnect), 1);
assert.ok(record.consumerTimer);
clearTimeout(record.consumerTimer);

console.log(JSON.stringify({
	ok: true,
	suite: "request-ack-recovery",
	durableAcceptanceCorrelated: true,
	queuedProgressRearmsWatchdog: true,
	consumerStartClearsWatchdog: true,
	acceptedReconnectMonitoredWithoutRedispatch: true,
	foreignAckRejected: true,
	transitions
}, null, 2));
