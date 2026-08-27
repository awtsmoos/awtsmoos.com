// B"H

const assert = require("node:assert/strict");
const { heartbeatOne } = require("./serverLifecycle.js");

function client(socket) {
	return {
		id: "client-test",
		isAlive: true,
		missedHeartbeats: 0,
		lastSeenAt: Date.now(),
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
assert.equal(heartbeatOne({}, healthy, Date.now()), true);
assert.equal(healthy.awaitingPong, true);
assert.equal(healthy.heartbeatWriteDeferred, false);

const blockedSocket = {
	destroyed: false,
	writable: true,
	writableLength: 128 * 1024 * 1024,
	write() { throw new Error("must not write above the bound"); }
};
const blocked = client(blockedSocket);
assert.equal(heartbeatOne({}, blocked, Date.now()), false);
assert.equal(blocked.awaitingPong, undefined);
assert.equal(blocked.heartbeatWriteDeferred, true);
assert.equal(blocked.lastTransportError, "heartbeat_socket_backpressure");

console.log(JSON.stringify({
	ok: true,
	suite: "websocket-heartbeat-isolation",
	backpressureDoesNotCreateFalseMiss: true
}, null, 2));
