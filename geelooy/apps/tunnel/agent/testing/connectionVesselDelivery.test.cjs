// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Delivery = require("../lib/connection-vessel/child-delivery.js");

/**
 * @file Proves persistence, ordered admission testimony, and reconnect replay.
 * @description
 * The Awtsmoos stores before speaking, then lets Awtsmoos.com hear acceptance,
 * living progress, and terminal answer in their truthful covenantal order.
 */
const inbox = [];
const outbox = [{ id: "answer-one" }];
const sentIpc = [];
const sentSocket = [];
const state = {
	activeWs: { opened: true },
	registrationConfirmed: true
};
const mailbox = {
	inbox: () => [...inbox],
	outbox: () => [...outbox],
	putInbox: envelope => inbox.push(envelope)
};
const runtime = Delivery.createDelivery({
	Send: {
		safeSend: (_ws, envelope) => {
			sentSocket.push(envelope);
			return true;
		}
	},
	mailbox,
	send: message => {
		sentIpc.push(message);
		return true;
	},
	state
});

runtime.enqueueRequest(state.activeWs, { requestId: "request-one" });
assert.equal(inbox.length, 1);
assert.equal(sentIpc.length, 0);
assert.equal(sentSocket.length, 2);
assert.deepEqual(sentSocket[0], {
	type: "TUNNEL_REQUEST_ACK",
	id: "request-one",
	requestId: "request-one",
	controlRequestId: "request-one",
	transportReceiptId: "request-one",
	acceptedAt: sentSocket[0].acceptedAt,
	durable: true
});
assert.equal(sentSocket[1].type, "TUNNEL_PROGRESS");
assert.equal(sentSocket[1].phase, "accepted_waiting_for_consumer");
assert.equal(sentSocket[1].stillRunning, true);

runtime.parentDidBecomeReady();
assert.equal(sentIpc[0].envelope.requestId, "request-one");
assert.equal(sentSocket[2].id, "answer-one");

state.registrationConfirmed = false;
assert.equal(runtime.flush(), 0);
state.registrationConfirmed = true;
assert.equal(runtime.flush(), 1);
assert.equal(sentSocket[3].id, "answer-one");

console.log(JSON.stringify({
	ok: true,
	suite: "connection-vessel-delivery",
	persistBeforeIpc: true,
	orderedAcceptanceAndProgress: true,
	parentAttachmentRedelivery: true,
	reconnectOutboxFlush: true
}, null, 2));
