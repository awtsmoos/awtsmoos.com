// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const EventEmitter = require("node:events");
const { createConnectionRuntime } = require("../lib/runtime/main-connection.js");
const Replacement = require("../lib/runtime/replacement-policy.js");

/**
 * B"H
 *
 * Socket-open is not registration. The Awtsmoos renews transport and identity;
 * Awtsmoos.com accepts only a successful acknowledgement for the expected name.
 */
class FakeSocket extends EventEmitter {
	constructor(url) {
		super();
		this.url = url;
		this.opened = true;
	}
	connect() {
		this.connected = true;
	}
	close(force) {
		this.closedForce = force;
		this.opened = false;
		this.emit("close");
	}
}

const receiptEvents = [];
const state = {
	activeWs: null,
	reconnectTimer: null,
	reconnectAttempt: 0,
	wasEverConnected: false,
	replacementRequested: false,
	generation: 0
};
const runtime = createConnectionRuntime({
	state,
	loadConfig: () => ({
		wsUrl: "ws://relay.test",
		tunnelName: "awt-expected"
	}),
	log() {},
	agentVersion: "test-agent",
	TinyWebSocket: FakeSocket,
	registerReady() {},
	Control: { markSeen() {} },
	Replacement,
	Receipt: {
		write(type, details) {
			receiptEvents.push({ type, details });
		},
		markServerSeen() {}
	},
	Send: { safeSend() {} },
	stats: () => ({}),
	enqueueRequest() {}
});

const acceptedSocket = runtime.connect();
acceptedSocket.emit("open");
assert.equal(state.registrationConfirmed, false);
acceptedSocket.emit("message", JSON.stringify({
	type: "TUNNEL_ACK",
	ok: true,
	tunnelName: "awt-expected",
	serverTime: "server-time"
}));
assert.equal(state.registrationConfirmed, true);
assert.equal(receiptEvents.at(-1).type, "registered");

const mismatchedSocket = runtime.connect();
mismatchedSocket.emit("open");
mismatchedSocket.emit("message", JSON.stringify({
	type: "TUNNEL_ACK",
	ok: true,
	tunnelName: "awt-other"
}));
assert.equal(state.registrationConfirmed, false);
assert.equal(state.registrationRejected, true);
assert.equal(state.registrationFailureReason, "acknowledged_tunnel_name_mismatch");
assert.equal(receiptEvents.at(-1).type, "reconnecting");
assert.equal(
	receiptEvents.some(event => event.type === "registration_rejected"),
	true
);

clearTimeout(state.reconnectTimer);
state.reconnectTimer = null;
console.log(JSON.stringify({
	ok: true,
	suite: "main-connection-acknowledgement"
}, null, 2));
