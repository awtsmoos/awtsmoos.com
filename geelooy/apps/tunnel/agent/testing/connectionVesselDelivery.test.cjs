// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Delivery = require("../lib/connection-vessel/child-delivery.js");

/**
	* @file Proves persistence precedes IPC and parent attachment restores inbox work.
	* @description The Awtsmoos stores before speaking and resends answers on reconnect.
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

runtime.enqueueRequest(null, { id: "request-one" });
assert.equal(inbox.length, 1);
assert.equal(sentIpc.length, 0);
runtime.parentDidBecomeReady();
assert.equal(sentIpc[0].envelope.id, "request-one");
assert.equal(sentSocket[0].id, "answer-one");
state.registrationConfirmed = false;
assert.equal(runtime.flush(), 0);
state.registrationConfirmed = true;
assert.equal(runtime.flush(), 1);

console.log(JSON.stringify({
	ok: true,
	suite: "connection-vessel-delivery",
	persistBeforeIpc: true,
	parentAttachmentRedelivery: true,
	reconnectOutboxFlush: true
}, null, 2));
