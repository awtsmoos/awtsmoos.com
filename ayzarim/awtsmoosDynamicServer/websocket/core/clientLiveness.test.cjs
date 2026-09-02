// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Live = require("./clientLiveness.js");

/**
 * @file Proves stale clocks cannot erase a route and terminal fences cannot resurrect.
 * @description
 * The Awtsmoos renews truth only through evidence; Awtsmoos.com therefore keeps an old but
 * usable socket routable while probing, yet once proven failure crosses the final fence no
 * late frame may sing yesterday's vessel back into today's generation.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THIS REGRESSION
 * Historical symptom: stale_unproven made a live tunnel vanish, then markSeen revived the
 * same socket and generation. Age alone is not death; terminal proof is one-way.
 */
const now = 100000;
const limits = {
	maxMissedHeartbeats: 3,
	probeGraceMs: 10000,
	staleMs: 90000,
	localBackpressureGraceMs: 90000
};
const socket = {
	destroyed: false,
	writable: true,
	writableEnded: false,
	closed: false
};

function livingClient(lastSeenAt = now) {
	return {
		isAlive: true,
		missedHeartbeats: 0,
		lastSeenAt,
		heartbeatAt: lastSeenAt,
		socket
	};
}

const aged = livingClient(now - 120000);
assert.equal(Live.evidenceIsFresh(aged, now, limits), false);
assert.equal(Live.canRoute(aged, now, limits), true);
assert.equal(Live.stateFor(aged, now, limits), "stale_probing");
assert.equal(Live.isTerminal(aged), false);

const probing = livingClient();
Live.markHeartbeatSent(probing, now + 1);
assert.equal(probing.missedHeartbeats, 0);
assert.equal(Live.stateFor(probing, now + 1, limits), "probing");
Live.markHeartbeatSent(probing, now + 10001);
assert.equal(probing.missedHeartbeats, 1);
assert.equal(Live.canRoute(probing, now + 10001, limits), true);
assert.equal(Live.stateFor(probing, now + 10001, limits), "degraded");

probing.awaitingPong = true;
probing.missedHeartbeats = 3;
probing.lastSeenAt = now + 10002;
probing.heartbeatAt = now + 10002;
assert.equal(Live.shouldTerminate(probing, now + 15000, limits), false);
assert.equal(Live.stateFor(probing, now + 15000, limits), "suspect");
probing.lastSeenAt = now - 120000;
probing.heartbeatAt = now - 120000;
assert.equal(Live.shouldTerminate(probing, now, limits), true);
assert.equal(probing.livenessTerminalReason, "heartbeat_probe_expired");
assert.equal(Live.canRoute(probing, now, limits), false);
assert.equal(Live.stateFor(probing, now, limits), "terminal_fenced");
const fencedSeenAt = probing.lastSeenAt;
Live.markSeen(probing, now + 5000);
assert.equal(probing.lastSeenAt, fencedSeenAt);
assert.equal(probing.missedHeartbeats, 3);
assert.equal(Live.canRoute(probing, now + 5000, limits), false);

const closed = livingClient();
closed.socket = { destroyed: true, writable: false };
assert.equal(Live.canRoute(closed, now, limits), false);
assert.equal(closed.livenessTerminalReason, "socket_unusable");
assert.equal(Live.stateFor(closed, now, limits), "terminal_fenced");

const legacyFalse = livingClient();
legacyFalse.isAlive = false;
legacyFalse.missedHeartbeats = 1;
const snapshot = Live.livenessSnapshot(legacyFalse, now + 1000, limits);
assert.equal(snapshot.rawIsAlive, false);
assert.equal(snapshot.isAlive, true);
assert.equal(snapshot.livenessState, "degraded");

console.log(JSON.stringify({
	ok: true,
	suite: "client-liveness",
	staleAgeAloneDoesNotDropRoute: true,
	terminalFenceCannotResurrect: true
}, null, 2));
