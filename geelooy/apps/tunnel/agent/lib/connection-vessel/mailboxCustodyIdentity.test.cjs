// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const ChildRouter = require("./child-message-router.js");
const ControllerRouter = require("./controller-message-router.js");
const CustodyMetadata = require("./mailbox-custody-metadata.js");
const Protocol = require("./protocol.js");

/**
 * @file Proves accepted custody keeps one deed identity across parent and child IPC.
 * @description
 * The Awtsmoos gives every shliach-deed one enduring name; Awtsmoos.com therefore
 * carries request, session, transport, and generation testimony through ACK custody
 * instead of creating anonymous generation-zero shadows that confuse later healing.
 */
const envelope = {
	id: "transport-receipt-1",
	transportReceiptId: "transport-receipt-1",
	requestId: "request-deed-1",
	requestKey: "request-key-1",
	controlRequestId: "control-request-1",
	logicalAgentId: "logical-agent-1",
	agentSessionId: "agent-session-1",
	payload: {}
};
let acknowledgement = null;
let enqueued = null;

const controller = ControllerRouter.createMessageRouter({
	enqueueRequest(_proxy, acceptedEnvelope) {
		enqueued = acceptedEnvelope;
	},
	log() {},
	mirror() {},
	notify(message) {
		acknowledgement = message;
		return true;
	},
	onRegistered() {},
	onTerminal() {},
	proxy: {},
	publishStats() {}
});

assert.equal(controller.handleRequest(envelope), true);
assert.equal(enqueued, envelope);
assert.equal(acknowledgement.type, Protocol.TYPES.ACK);
assert.equal(acknowledgement.id, "transport-receipt-1");
assert.equal(acknowledgement.requestId, "request-deed-1");
assert.equal(acknowledgement.requestKey, "request-key-1");
assert.equal(acknowledgement.logicalAgentId, "logical-agent-1");
assert.equal(acknowledgement.agentSessionId, "agent-session-1");

let childReceipt = null;
let childAck = null;
const child = ChildRouter.createChildMessageRouter({
	noteParentCustody(receiptId, message) {
		childReceipt = receiptId;
		childAck = message;
	}
});
assert.equal(child.acknowledge(acknowledgement), true);
assert.equal(childReceipt, "transport-receipt-1");
assert.equal(childAck, acknowledgement);

const custody = CustodyMetadata.fromAcknowledgement(childAck, 7);
assert.deepEqual(custody, {
	requestId: "request-deed-1",
	requestKey: "request-key-1",
	logicalAgentId: "logical-agent-1",
	agentSessionId: "agent-session-1",
	controlRequestId: "control-request-1",
	transportReceiptId: "transport-receipt-1",
	generation: 7
});

console.log("BHY parent-child custody preserves exact deed identity and live generation");
