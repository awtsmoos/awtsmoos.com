//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	admitSocket,
	releaseSocketAdmission,
	socketAdmissionSnapshot
} = require("./socketAdmission.js");
const { socketPeerKey } = require("./socketAdmissionPolicy.js");

/** Creates a bounded fake raw socket that records pre-handshake rejection text. */
function fakeSocket() {
	return {
		ended: "",
		end(value = "") {
			this.ended += String(value);
		},
		destroy() {
			this.destroyed = true;
		}
	};
}

/** Creates one test server with explicit tiny limits for deterministic pressure. */
function server(environment = {}) {
	return {
		socketAdmissionEnvironment: {
			AWTSMOOS_WS_MAX_CONNECTIONS: 2,
			AWTSMOOS_WS_MAX_PER_PEER: 2,
			AWTSMOOS_WS_ATTEMPTS_PER_WINDOW: 10,
			AWTSMOOS_WS_ATTEMPT_WINDOW_MS: 1_000,
			AWTSMOOS_WS_TRACKED_PEERS: 10,
			...environment
		}
	};
}

/** Creates one direct-address upgrade request without trusting forwarded metadata. */
function request(address, headers = {}) {
	return {
		headers,
		socket: {
			remoteAddress: address
		}
	};
}

test("global realtime capacity rejects before handshake and recovers after release", () => {
	const realtime = server();
	const first = admitSocket(realtime, request("10.0.0.1"), fakeSocket(), 0);
	const second = admitSocket(realtime, request("10.0.0.2"), fakeSocket(), 0);
	const deniedSocket = fakeSocket();
	assert.ok(first);
	assert.ok(second);
	assert.equal(admitSocket(realtime, request("10.0.0.3"), deniedSocket, 0), null);
	assert.match(deniedSocket.ended, /503 Service Unavailable/);
	assert.match(deniedSocket.ended, /worker_capacity/);
	assert.equal(releaseSocketAdmission(realtime, first), true);
	assert.ok(admitSocket(realtime, request("10.0.0.3"), fakeSocket(), 1));
	assert.equal(socketAdmissionSnapshot(realtime).peak, 2);
});

test("per-peer concentration and reconnect storms receive retryable 429", () => {
	const realtime = server({
		AWTSMOOS_WS_MAX_CONNECTIONS: 20,
		AWTSMOOS_WS_MAX_PER_PEER: 1,
		AWTSMOOS_WS_ATTEMPTS_PER_WINDOW: 2
	});
	const first = admitSocket(realtime, request("10.0.0.9"), fakeSocket(), 0);
	const peerDenied = fakeSocket();
	assert.equal(admitSocket(realtime, request("10.0.0.9"), peerDenied, 10), null);
	assert.match(peerDenied.ended, /429 Too Many Requests/);
	assert.match(peerDenied.ended, /peer_capacity/);
	assert.equal(releaseSocketAdmission(realtime, first), true);
	const rateDenied = fakeSocket();
	assert.equal(admitSocket(realtime, request("10.0.0.9"), rateDenied, 20), null);
	assert.match(rateDenied.ended, /reconnect_rate/);
});

test("draining rejects every new realtime vessel before handshake", () => {
	const realtime = server();
	realtime.isDraining = true;
	const socket = fakeSocket();
	assert.equal(admitSocket(realtime, request("10.0.0.4"), socket, 0), null);
	assert.match(socket.ended, /503 Service Unavailable/);
	assert.match(socket.ended, /draining/);
});

test("forwarded peer identity is trusted only behind a loopback proxy", () => {
	const headers = {
		"x-forwarded-for": "203.0.113.7, 203.0.113.8"
	};
	assert.equal(socketPeerKey(request("127.0.0.1", headers)), "203.0.113.7");
	assert.equal(socketPeerKey(request("198.51.100.4", headers)), "198.51.100.4");
});
