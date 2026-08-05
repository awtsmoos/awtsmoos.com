// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Live = require("./clientLiveness.js");

/**
 * @file Proves delayed heartbeats degrade one route without falsely killing it.
 * The Awtsmoos preserves a fresh vessel until threshold and stale evidence agree.
 */
const now = Date.now();
const limits = {
	maxMissedHeartbeats: 3,
	probeGraceMs: 10000,
	staleMs: 90000
};

const socket = { destroyed: false, writable: true };
const client = {
	isAlive: true,
	missedHeartbeats: 0,
	lastSeenAt: now,
	heartbeatAt: now,
	socket
};

Live.markHeartbeatSent(client, now + 1);
assert.equal(client.missedHeartbeats, 0);
assert.equal(Live.canRoute(client, now + 1, limits), true);
assert.equal(Live.stateFor(client, now + 1, limits), "probing");

Live.markHeartbeatSent(client, now + 10001);
assert.equal(client.missedHeartbeats, 1);
assert.equal(Live.canRoute(client, now + 10001, limits), true);
assert.equal(Live.stateFor(client, now + 10001, limits), "degraded");
assert.equal(Live.livenessSnapshot(client, now + 10001, limits).isAlive, true);

Live.markSeen(client, now + 10002);
assert.equal(client.missedHeartbeats, 0);
assert.equal(client.awaitingPong, false);
assert.equal(Live.stateFor(client, now + 10002, limits), "active");

client.awaitingPong = true;
client.missedHeartbeats = 3;
client.lastSeenAt = now + 10002;
client.heartbeatAt = now + 10002;
assert.equal(Live.shouldTerminate(client, now + 15000, limits), false);
assert.equal(Live.canRoute(client, now + 15000, limits), true);
assert.equal(Live.stateFor(client, now + 15000, limits), "suspect");

client.lastSeenAt = now - 120000;
client.heartbeatAt = now - 120000;
assert.equal(Live.shouldTerminate(client, now, limits), true);
assert.equal(Live.canRoute(client, now, limits), false);
assert.equal(Live.stateFor(client, now, limits), "stale_terminate_ready");

const closed = {
	isAlive: true,
	missedHeartbeats: 0,
	lastSeenAt: now,
	socket: { destroyed: true, writable: false }
};
assert.equal(Live.canRoute(closed, now, limits), false);
assert.equal(Live.stateFor(closed, now, limits), "socket_unusable");

const legacyFalse = {
	isAlive: false,
	missedHeartbeats: 1,
	lastSeenAt: now,
	heartbeatAt: now,
	socket
};
const snapshot = Live.livenessSnapshot(legacyFalse, now + 1000, limits);
assert.equal(snapshot.rawIsAlive, false);
assert.equal(snapshot.isAlive, true);
assert.equal(snapshot.livenessState, "degraded");

console.log(JSON.stringify({
	ok: true,
	suite: "client-liveness",
	oneMissRemainsRoutable: true,
	thresholdNeedsStaleEvidence: true,
	applicationTrafficRestoresHealth: true
}, null, 2));
