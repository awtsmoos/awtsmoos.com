// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Delivery = require("../lib/connection-vessel/child-delivery.js");

/**
 * @file Proves acceptance recovery is durable across sockets but fenced by child incarnation.
 * @description
 * The Awtsmoos preserves one admitted deed while its socket garment changes; Awtsmoos.com
 * may restate custody once per socket generation, but a newborn child cannot inherit an older
 * child's inbox merely because transport identities and generation numbers resemble one another.
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
const firstState = state(1, false, "child-current");
const first = runtime(firstState, firstFrames, inbox);
first.enqueueRequest(firstState.activeWs, request);
assert.equal(inbox.length, 1);
assert.equal(inbox[0].childIncarnationId, "child-current");
assert.equal(firstFrames.length, 0);
assert.equal(first.pendingAcceptances(), 1);
assert.equal(first.pendingProgress(), 1);

const recoveredFrames = [];
const recoveredState = state(2, true, "child-current");
const recovered = runtime(recoveredState, recoveredFrames, inbox);
assert.equal(recovered.flush(), 0);
assert.deepEqual(recoveredFrames.map(frame => frame.type), [
	"TUNNEL_REQUEST_ACK",
	"TUNNEL_PROGRESS"
]);
assert.equal(recovered.pendingAcceptances(), 0);
assert.equal(recovered.pendingProgress(), 0);
assertIdentities(recoveredFrames[0], request);
assertIdentities(recoveredFrames[1], request);

recovered.flush();
assert.equal(recoveredFrames.length, 2, "same socket generation must not repeat recovered custody");
recoveredState.generation = 3;
recovered.flush();
assert.equal(recoveredFrames.length, 4, "new socket generation may restate current-child custody once");
assert.deepEqual(recoveredFrames.slice(2).map(frame => frame.type), [
	"TUNNEL_REQUEST_ACK",
	"TUNNEL_PROGRESS"
]);

const replacementFrames = [];
const replacement = runtime(state(1, true, "child-replacement"), replacementFrames, inbox);
assert.equal(replacement.flush(), 0);
assert.deepEqual(replacementFrames, []);

console.log(JSON.stringify({
	ok: true,
	suite: "connection-vessel-acceptance-recovery",
	recoveredAcrossSocketGeneration: true,
	oncePerGeneration: true,
	crossIncarnationReplayBlocked: true,
	correlationPreserved: true
}, null, 2));

function state(generation, registrationConfirmed, childIncarnationId) {
	return {
		activeWs: { opened: true },
		childIncarnationId,
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
			putInbox(envelope) {
				durableInbox.push({
					...envelope,
					childIncarnationId: runtimeState.childIncarnationId
				});
			}
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
