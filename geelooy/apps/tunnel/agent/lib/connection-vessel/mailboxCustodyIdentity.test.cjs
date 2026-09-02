// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const ChildCustody = require("./child-runtime-custody.js");
const ControllerRouter = require("./controller-message-router.js");
const CustodyMetadata = require("./mailbox-custody-metadata.js");

/**
 * @file Proves parent custody binds request identity to exact child incarnation and generation.
 * @description
 * The Awtsmoos gives every accepted deed one living vessel. Awtsmoos.com therefore rejects
 * a delayed ACK from an older child before it can refresh custody or reconnect pressure,
 * while the current child's ACK preserves request, session, generation, and incarnation.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * A request without current generation testimony must fail closed before entering parent
 * execution. Regression: mailboxCustodyIdentity.test.cjs and connectionCustodyProgressIpc.test.cjs.
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
let routedEnvelope = null;
const controller = ControllerRouter.createMessageRouter({
	enqueueRequest(_proxy, value) {
		routedEnvelope = value;
	},
	generation: () => 7,
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
assert.equal(controller.handleRequest(envelope, "child-current"), true);
assert.equal(acknowledgement.childIncarnationId, "child-current");
assert.equal(acknowledgement.generation, 7);
assert.equal(routedEnvelope.connectionCustody.generation, 7);
assert.equal(routedEnvelope.connectionCustody.childIncarnationId, "child-current");

const metadata = CustodyMetadata.fromAcknowledgement(
	acknowledgement,
	7,
	"child-current"
);
assert.equal(metadata.generation, 7);
assert.equal(metadata.childIncarnationId, "child-current");
assert.equal(metadata.requestId, "request-deed-1");
assert.equal(metadata.agentSessionId, "agent-session-1");

const recorded = [];
const parentReceipts = [];
const custody = ChildCustody.createCustody({
	mailbox: {
		noteParentCustody(receiptId, value) {
			recorded.push([receiptId, value]);
			return true;
		}
	},
	parent: {
		noteCustody(receiptId) {
			parentReceipts.push(receiptId);
			return true;
		}
	},
	state: {
		childIncarnationId: "child-current",
		generation: 7,
		reconnectAttempt: 4
	}
});
assert.equal(custody.noteParentCustody("old-receipt", {
	...acknowledgement,
	childIncarnationId: "child-old"
}), false);
assert.equal(recorded.length, 0);
assert.equal(parentReceipts.length, 0);

assert.equal(custody.noteParentCustody("transport-receipt-1", acknowledgement), true);
assert.equal(recorded.length, 1);
assert.equal(recorded[0][1].childIncarnationId, "child-current");
assert.deepEqual(parentReceipts, ["transport-receipt-1"]);

console.log("BHY only exact-generation, exact-incarnation ACKs become fresh parent custody");
