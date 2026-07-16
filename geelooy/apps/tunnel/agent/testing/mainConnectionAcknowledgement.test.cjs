// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const EventEmitter = require("node:events");
const { createConnectionRuntime } = require("../lib/runtime/main-connection.js");
const Replacement = require("../lib/runtime/replacement-policy.js");

/**
 * @file Proves socket-open cannot impersonate authenticated registration.
 * @description
 * The Awtsmoos renews transport, route ID, and recovery pressure independently.
 * Awtsmoos.com resets reconnect backoff only after an expected-name ACK and closes
 * mismatched registration before ordinary work can enter the queue.
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
	reconnectAttempt: 5,
	wasEverConnected: false,
	replacementRequested: false,
	generation: 0,
	tunnelId: "",
	tunnelName: "",
	lastRegisteredAt: 0
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
	enqueueRequest() {},
	random: () => 0.5
});

const acceptedSocket = runtime.connect();
acceptedSocket.emit("open");
assert.equal(state.registrationConfirmed, false);
assert.equal(state.reconnectAttempt, 5);
acceptedSocket.emit("message", JSON.stringify({
	type: "TUNNEL_ACK",
	ok: true,
	tunnelId: "tun_authoritative_test",
	tunnelName: "awt-expected",
	serverTime: "server-time"
}));
assert.equal(state.registrationConfirmed, true);
assert.equal(state.tunnelId, "tun_authoritative_test");
assert.equal(state.reconnectAttempt, 0);
assert.equal(state.lastRegisteredAt > 0, true);
assert.equal(receiptEvents.at(-1).type, "registered");
assert.equal(receiptEvents.at(-1).details.tunnelId, "tun_authoritative_test");

state.reconnectAttempt = 3;
const mismatchedSocket = runtime.connect();
mismatchedSocket.emit("open");
mismatchedSocket.emit("message", JSON.stringify({
	type: "TUNNEL_ACK",
	ok: true,
	tunnelId: "tun_wrong_name",
	tunnelName: "awt-other"
}));
assert.equal(state.registrationConfirmed, false);
assert.equal(state.registrationRejected, true);
assert.equal(state.reconnectAttempt > 0, true);
assert.equal(state.registrationFailureReason, "acknowledged_tunnel_name_mismatch");
assert.equal(
	receiptEvents.some((event) => event.type === "registration_rejected"),
	true
);

clearTimeout(state.reconnectTimer);
state.reconnectTimer = null;
console.log(JSON.stringify({
	ok: true,
	suite: "main-connection-acknowledgement",
	authoritativeTunnelId: true,
	backoffResetsOnlyAfterAck: true
}, null, 2));
