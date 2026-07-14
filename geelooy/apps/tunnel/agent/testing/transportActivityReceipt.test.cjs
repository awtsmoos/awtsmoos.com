// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const EventEmitter = require("node:events");
const { wireConnectionSocket } = require("../lib/runtime/main-connection-socket.js");

/**
 * B"H
 *
 * Quiet WebSocket heartbeats are living server evidence. The Awtsmoos renews
 * every inbound transport pulse; Awtsmoos.com proves it refreshes only the
 * acknowledged active generation, at a bounded cadence, with deterministic cleanup.
 */
const rawSocket = new EventEmitter();
const socket = new EventEmitter();
socket.socket = rawSocket;
socket.close = () => {};

let now = 100000;
let markedSeen = 0;
const receiptEvents = [];
const state = {
	activeWs: socket,
	reconnectAttempt: 0,
	registrationConfirmed: false,
	registrationRejected: false,
	replacementRequested: false,
	wasEverConnected: false
};
const dependencies = {
	state,
	now: () => now,
	transportReceiptIntervalMs: 10000,
	agentVersion: "test-agent",
	Control: {
		markSeen() {
			markedSeen += 1;
		}
	},
	Receipt: {
		write(type, details) {
			receiptEvents.push({ type, details });
		},
		markServerSeen(details) {
			receiptEvents.push({
				type: "transport_seen",
				details
			});
		}
	},
	log() {},
	registerReady() {}
};
const generation = 7;
const owns = (candidate, candidateGeneration) => (
	state.activeWs === candidate && candidateGeneration === generation
);

wireConnectionSocket({
	dependencies,
	ws: socket,
	config: {
		tunnelName: "awt-transport-test"
	},
	generation,
	messages: {
		handle() {}
	},
	owns,
	scheduleReconnect() {}
});

socket.emit("open");
const seenAtOpen = markedSeen;
assert.equal(rawSocket.listenerCount("data"), 1);
rawSocket.emit("data", Buffer.from("ping-before-ack"));
assert.equal(transportEvents().length, 0);
assert.equal(markedSeen, seenAtOpen + 1);

state.registrationConfirmed = true;
rawSocket.emit("data", Buffer.from("ping-one"));
assert.equal(transportEvents().length, 1);
assert.equal(transportEvents()[0].details.generation, generation);

now += 5000;
rawSocket.emit("data", Buffer.from("ping-throttled"));
assert.equal(transportEvents().length, 1);

now += 5000;
rawSocket.emit("data", Buffer.from("ping-two"));
assert.equal(transportEvents().length, 2);

state.activeWs = new EventEmitter();
now += 10000;
rawSocket.emit("data", Buffer.from("stale-generation"));
assert.equal(transportEvents().length, 2);

state.activeWs = socket;
socket.emit("close");
assert.equal(rawSocket.listenerCount("data"), 0);
rawSocket.emit("data", Buffer.from("after-close"));
assert.equal(transportEvents().length, 2);

console.log(JSON.stringify({
	ok: true,
	suite: "transport-activity-receipt",
	transportRefreshes: transportEvents().length,
	transportObservations: markedSeen - seenAtOpen
}, null, 2));

function transportEvents() {
	return receiptEvents.filter(event => event.type === "transport_seen");
}
