// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const ChildRouter = require("../lib/connection-vessel/child-message-router.js");
const ParentRouter = require("../lib/connection-vessel/controller-message-router.js");
const Protocol = require("../lib/connection-vessel/protocol.js");

/**
 * @file Proves parent queue custody never masquerades as terminal settlement.
 * @description
 * The Awtsmoos carries one accepted deed across IPC without erasing its witness.
 * Awtsmoos.com may note that the parent admitted the request, yet the durable child
 * inbox remains until the relay later confirms a terminal response independently.
 */
const admitted = [];
const acknowledgements = [];
const parentCustody = [];
const settled = [];
const logs = [];
const parent = ParentRouter.createMessageRouter({
	enqueueRequest: (_proxy, envelope) => admitted.push(envelope),
	log: (level, message) => logs.push({ level, message }),
	mirror() {},
	notify: message => {
		acknowledgements.push(message);
		return true;
	},
	onRegistered() {},
	onTerminal() {},
	proxy: {},
	publishStats() {}
});

const request = Protocol.message(Protocol.TYPES.REQUEST, {
	envelope: { requestId: "custody-one", action: "read" }
});
assert.equal(parent.handle(request), true);
assert.equal(admitted.length, 1);
assert.equal(acknowledgements.length, 1);
assert.equal(acknowledgements[0].type, Protocol.TYPES.ACK);
assert.equal(acknowledgements[0].transportReceiptId, "custody-one");

const child = ChildRouter.createChildMessageRouter({
	flush() {},
	mailbox: {
		acknowledge: receiptId => settled.push(receiptId)
	},
	noteParentCustody: receiptId => parentCustody.push(receiptId),
	parentDidBecomeReady() {},
	stop() {},
	transmit() {},
	updateParentStats() {}
}, {
	exitProcess() {}
});
assert.equal(child.handle(acknowledgements[0]), true);
assert.deepEqual(parentCustody, ["custody-one"]);
assert.deepEqual(settled, []);

const failedAcknowledgements = [];
const rejectingParent = ParentRouter.createMessageRouter({
	enqueueRequest() {
		throw new Error("queue_unavailable");
	},
	log: (level, message) => logs.push({ level, message }),
	mirror() {},
	notify: message => failedAcknowledgements.push(message),
	onRegistered() {},
	onTerminal() {},
	proxy: {},
	publishStats() {}
});
assert.equal(rejectingParent.handle(request), false);
assert.equal(failedAcknowledgements.length, 0);
assert.equal(logs.some(entry => entry.message.includes("queue_unavailable")), true);

console.log(JSON.stringify({
	ok: true,
	suite: "connection-vessel-custody",
	ackAfterAdmission: true,
	parentCustodyDoesNotSettleDurableInbox: true,
	failurePreservesReceipt: true
}, null, 2));
