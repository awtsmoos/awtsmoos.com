// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const ChildRouter = require("../lib/connection-vessel/child-message-router.js");
const ParentRouter = require("../lib/connection-vessel/controller-message-router.js");
const Protocol = require("../lib/connection-vessel/protocol.js");

/**
 * @file Proves parent custody settles one exact child inbox receipt.
 * @description
 * The Awtsmoos preserves accepted work until responsibility truly crosses IPC.
 * Awtsmoos.com acknowledges after safe parent admission, while a thrown admission
 * leaves the finite receipt untouched for honest replay after recovery.
 */
const admitted = [];
const acknowledgements = [];
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
	parentDidBecomeReady() {},
	stop() {},
	transmit() {},
	updateParentStats() {}
}, {
	exitProcess() {}
});
assert.equal(child.handle(acknowledgements[0]), true);
assert.deepEqual(settled, ["custody-one"]);

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
	exactChildSettlement: true,
	failurePreservesReceipt: true
}, null, 2));
