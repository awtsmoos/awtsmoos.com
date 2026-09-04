// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Protocol = require("./protocol.js");
const { createMessageRouter } = require("./controller-message-router.js");

/**
 * @file Proves rejected ingress cannot borrow the ACK that belongs to admitted custody.
 * @description
 * The Awtsmoos separates yes from no; Awtsmoos.com therefore tests that rejection returns
 * through REJECT alone, while admitted and legacy-stubbed work keep their established ACK flow.
 */
function createHarness(admission) {
	const notices = [];
	const progress = [];
	const router = createMessageRouter({
		enqueueRequest: () => admission,
		generation: () => 7,
		log: () => {},
		mirror: () => {},
		notify: message => {
			notices.push(message);
			return true;
		},
		onRegistered: () => {},
		onRecoveryRequired: () => {},
		onTerminal: () => {},
		proxy: {
			progressCustody: (...args) => progress.push(args)
		},
		publishStats: () => {}
	});
	return { notices, progress, router };
}

function envelope(id) {
	return {
		id,
		payload: {
			agentSessionId: "session-one",
			logicalAgentId: "agent-one",
			requestId: id
		}
	};
}

(function rejectsWithoutAck() {
	const harness = createHarness({ accepted: false, reason: "identity_rejected" });
	assert.equal(harness.router.handleRequest(envelope("receipt-rejected"), "child-current"), true);
	assert.equal(harness.notices.length, 1);
	assert.equal(harness.notices[0].type, Protocol.TYPES.REJECT);
	assert.equal(harness.notices[0].generation, 7);
	assert.equal(harness.progress.length, 0);
})();

(function acceptsWithAckAndProgress() {
	const harness = createHarness({ accepted: true, lane: "p4_bulk" });
	assert.equal(harness.router.handleRequest(envelope("receipt-accepted"), "child-current"), true);
	assert.equal(harness.notices[0].type, Protocol.TYPES.ACK);
	assert.equal(harness.progress.length, 1);
})();

(function preservesLegacyUndefinedStub() {
	const harness = createHarness(undefined);
	assert.equal(harness.router.handleRequest(envelope("receipt-legacy"), "child-current"), true);
	assert.equal(harness.notices[0].type, Protocol.TYPES.ACK);
	assert.equal(harness.progress.length, 1);
})();

console.log("B\"H rejected ingress controller regression passed");
