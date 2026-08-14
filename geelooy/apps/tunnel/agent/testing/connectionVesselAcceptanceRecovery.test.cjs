// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Delivery = require("../lib/connection-vessel/child-delivery.js");

/**
 * @file Proves acceptance and initial progress survive registration races.
 * @description
 * The Awtsmoos stores the deed before the socket can speak; Awtsmoos.com then
 * replays acceptance before motion, preserving every identity in ordered light.
 */
const inbox = [];
const socketFrames = [];
const parentFrames = [];
const state = {
	activeWs: { opened: true },
	registrationConfirmed: false
};
const runtime = Delivery.createDelivery({
	Send: {
		safeSend(_socket, envelope) {
			socketFrames.push(envelope);
			return true;
		}
	},
	mailbox: {
		inbox: () => [...inbox],
		outbox: () => [],
		putInbox(envelope) {
			inbox.push(envelope);
		}
	},
	send(message) {
		parentFrames.push(message);
		return true;
	},
	state
});

const racedRequest = {
	type: "TUNNEL_REQUEST",
	id: "frame-one",
	requestId: "request-one",
	controlRequestId: "control-one",
	transportReceiptId: "receipt-one",
	payload: { action: "read" }
};
runtime.enqueueRequest(state.activeWs, racedRequest);
assert.equal(inbox.length, 1);
assert.equal(socketFrames.length, 0);
assert.equal(runtime.pendingAcceptances(), 1);
assert.equal(runtime.pendingProgress(), 1);

state.registrationConfirmed = true;
assert.equal(runtime.flush(), 0);
assert.equal(runtime.pendingAcceptances(), 0);
assert.equal(runtime.pendingProgress(), 0);
assert.equal(socketFrames.length, 2);
assert.equal(socketFrames[0].type, "TUNNEL_REQUEST_ACK");
assert.equal(socketFrames[1].type, "TUNNEL_PROGRESS");
assert.equal(socketFrames[1].phase, "accepted_waiting_for_consumer");
assert.equal(socketFrames[1].stillRunning, true);
assertIdentities(socketFrames[0], racedRequest);
assertIdentities(socketFrames[1], racedRequest);

runtime.parentDidBecomeReady();
assert.equal(parentFrames.length, 1);
assert.deepEqual(parentFrames[0].envelope, racedRequest);

const immediateRequest = {
	type: "TUNNEL_REQUEST",
	id: "frame-two",
	payload: {
		action: "list",
		controlRequestId: "control-two",
		transportReceiptId: "receipt-two"
	}
};
runtime.enqueueRequest(state.activeWs, immediateRequest);
assert.equal(socketFrames.length, 4);
assert.equal(socketFrames[2].type, "TUNNEL_REQUEST_ACK");
assert.equal(socketFrames[3].type, "TUNNEL_PROGRESS");
assert.equal(socketFrames[3].controlRequestId, "control-two");
assert.equal(socketFrames[3].transportReceiptId, "receipt-two");

console.log(JSON.stringify({
	ok: true,
	suite: "connection-vessel-acceptance-recovery",
	registrationRaceRecovered: true,
	consumerProgressRecovered: true,
	correlationPreserved: true
}, null, 2));

function assertIdentities(actual, expected) {
	assert.equal(actual.id, expected.id);
	assert.equal(actual.requestId, expected.requestId);
	assert.equal(actual.controlRequestId, expected.controlRequestId);
	assert.equal(actual.transportReceiptId, expected.transportReceiptId);
}
