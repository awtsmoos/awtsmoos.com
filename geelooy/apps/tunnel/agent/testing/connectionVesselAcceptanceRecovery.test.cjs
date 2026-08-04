// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Delivery = require("../lib/connection-vessel/child-delivery.js");

/**
 * @file Proves acceptance and progress are reconstructed from durable inbox custody.
 * @description
 * The Awtsmoos admits one request before execution. A dead child may forget memory,
 * but a new generation reads the inbox, re-speaks acceptance once, and never dispatches
 * a second command merely because the relay missed the first testimony.
 */
const inbox = [];
const request = {
	type: "TUNNEL_REQUEST",
	id: "frame-one",
	requestId: "request-one",
	controlRequestId: "control-one",
	transportReceiptId: "receipt-one",
	payload: { action: "commandStart" }
};

const firstFrames = [];
const firstState = state(1, false);
const first = runtime(firstState, firstFrames, inbox);
first.enqueueRequest(firstState.activeWs, request);
assert.equal(inbox.length, 1);
assert.equal(firstFrames.length, 0);
assert.equal(first.pendingAcceptances(), 1);
assert.equal(first.pendingProgress(), 1);

const secondFrames = [];
const secondState = state(2, true);
const reborn = runtime(secondState, secondFrames, inbox);
assert.equal(reborn.flush(), 0);
assert.deepEqual(secondFrames.map(frame => frame.type), [
	"TUNNEL_REQUEST_ACK",
	"TUNNEL_PROGRESS"
]);
assert.equal(reborn.pendingAcceptances(), 0);
assert.equal(reborn.pendingProgress(), 0);
assertIdentities(secondFrames[0], request);
assertIdentities(secondFrames[1], request);

reborn.flush();
assert.equal(secondFrames.length, 2, "same generation must not repeat recovered receipts");
secondState.generation = 3;
reborn.flush();
assert.equal(secondFrames.length, 4, "new socket generation may restate durable custody once");
assert.deepEqual(secondFrames.slice(2).map(frame => frame.type), [
	"TUNNEL_REQUEST_ACK",
	"TUNNEL_PROGRESS"
]);

console.log(JSON.stringify({
	ok: true,
	suite: "connection-vessel-acceptance-recovery",
	recoveredAcrossChildRestart: true,
	oncePerGeneration: true,
	correlationPreserved: true
}, null, 2));

function state(generation, registrationConfirmed) {
	return {
		activeWs: { opened: true },
		generation,
		registrationConfirmed
	};
}

function runtime(runtimeState, frames, durableInbox) {
	return Delivery.createDelivery({
		Send: {
			safeSend(_socket, envelope) {
				frames.push(envelope);
				return true;
			}
		},
		mailbox: {
			inbox: () => [...durableInbox],
			outbox: () => [],
			putInbox(envelope) { durableInbox.push(envelope); }
		},
		send() { return true; },
		state: runtimeState
	});
}

function assertIdentities(actual, expected) {
	assert.equal(actual.id, expected.id);
	assert.equal(actual.requestId, expected.requestId);
	assert.equal(actual.controlRequestId, expected.controlRequestId);
	assert.equal(actual.transportReceiptId, expected.transportReceiptId);
}
