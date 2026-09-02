// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Live = require("./clientLiveness.js");
const { heartbeatOne } = require("./serverLifecycle.js");

/**
 * @file Proves local heartbeat backpressure stays distinct yet cannot create an immortal zombie route.
 * @description
 * The Awtsmoos separates local vessel pressure from remote silence; Awtsmoos.com does not
 * falsely accuse the peer of a missed heartbeat. But bounded pressure has an end: the old
 * socket is fenced and destroyed so only a new connection may reveal life again.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THIS REGRESSION
 * Local send deferral must not increment missedHeartbeats, and it must not leave a reversible
 * stale socket routeless forever. Expired backpressure forces terminal replacement.
 */
const now = 100000;

function client(socket) {
	return {
		id: "client-test",
		isAlive: true,
		missedHeartbeats: 0,
		lastSeenAt: now,
		heartbeatAt: now,
		socket
	};
}

const healthySocket = {
	destroyed: false,
	writable: true,
	writableLength: 0,
	write() { return true; }
};
const healthy = client(healthySocket);
assert.equal(heartbeatOne({}, healthy, now), true);
assert.equal(healthy.awaitingPong, true);
assert.equal(healthy.heartbeatWriteDeferred, false);

const blockedSocket = {
	destroyCalls: 0,
	destroyed: false,
	writable: true,
	writableLength: 128 * 1024 * 1024,
	write() { throw new Error("must not write above the bound"); },
	destroy() {
		this.destroyCalls += 1;
		this.destroyed = true;
	}
};
const blocked = client(blockedSocket);
assert.equal(heartbeatOne({}, blocked, now), false);
assert.equal(blocked.missedHeartbeats, 0);
assert.equal(blocked.awaitingPong, undefined);
assert.equal(blocked.heartbeatWriteDeferred, true);
assert.equal(blocked.lastTransportError, "heartbeat_socket_backpressure");
assert.equal(Live.isTerminal(blocked), false);
assert.equal(blockedSocket.destroyCalls, 0);

const deadline = now + Live.DEFAULTS.localBackpressureGraceMs + 1;
assert.equal(heartbeatOne({}, blocked, deadline), false);
assert.equal(blocked.missedHeartbeats, 0);
assert.equal(blocked.livenessTerminalReason, "heartbeat_backpressure_expired");
assert.equal(blockedSocket.destroyCalls, 1);
assert.equal(Live.canRoute(blocked, deadline), false);
const fencedSeenAt = blocked.lastSeenAt;
Live.markSeen(blocked, deadline + 1);
assert.equal(blocked.lastSeenAt, fencedSeenAt);
assert.equal(Live.canRoute(blocked, deadline + 1), false);

console.log(JSON.stringify({
	ok: true,
	suite: "websocket-heartbeat-isolation",
	backpressureDoesNotCreateFalseMiss: true,
	boundedBackpressureForcesReplacement: true
}, null, 2));
