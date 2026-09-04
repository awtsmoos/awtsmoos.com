// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const EventEmitter = require("node:events");
const { createConnectionRuntime } = require("../lib/runtime/main-connection.js");
const Reconnect = require("../lib/runtime/main-reconnect-policy.js");
const Replacement = require("../lib/runtime/replacement-policy.js");

/**
 * @file Proves socket-open and registration ACK cannot impersonate action acceptance.
 * @description
 * The Awtsmoos separates transport, registration, and executable acceptance.
 * Awtsmoos.com preserves reconnect pressure through registration and resets it only
 * after one real accepted deed proves the action road is alive.
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
	generation: 0,
	lastRegisteredAt: 0,
	reconnectAttempt: 5,
	reconnectTimer: null,
	replacementRequested: false,
	tunnelId: "",
	tunnelName: "",
	wasEverConnected: false
};
const runtime = createConnectionRuntime({
	state,
	loadConfig: () => ({ wsUrl: "ws://relay.test", tunnelName: "awt-expected" }),
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
assert.equal(state.reconnectAttempt, 5);
assert.equal(state.lastRegisteredAt > 0, true);
assert.equal(receiptEvents.at(-1).type, "registered");
Reconnect.markAccepted(state);
assert.equal(state.reconnectAttempt, 0);

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
assert.equal(receiptEvents.some(event => event.type === "registration_rejected"), true);

clearTimeout(state.reconnectTimer);
state.reconnectTimer = null;
console.log(JSON.stringify({
	ok: true,
	suite: "main-connection-acknowledgement",
	authoritativeTunnelId: true,
	registrationPreservesBackoff: true,
	acceptanceResetsBackoff: true
}, null, 2));
