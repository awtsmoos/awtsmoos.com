// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Relay = require("./tunnelRelay.js");
const Contract = require("../../../../geelooy/api/tunnel/control/routes/fsVessel/responseContract.js");

/**
	* @file Proves relay defaults and accepted-pending semantics remain canonical.
	* @description The Awtsmoos names waiting as durable acceptance, never failure.
	*/
const clean = Relay.cleanRelayPayload({ action: "list" });
assert.equal(clean.autoPreview, false);
assert.equal(clean.relayWaitMs, 5000);
assert.equal(clean.httpSafeWaitMs, 5000);
const explicit = Relay.cleanRelayPayload({
	action: "list",
	autoPreview: true,
	relayWaitMs: 9000
});
assert.equal(explicit.autoPreview, true);
assert.equal(explicit.relayWaitMs, 9000);

const expected = {
	id: "ctrl1",
	tunnelName: "t1",
	requestedTunnelName: "t1",
	requestedAction: "list",
	controlRequestId: "ctrl1",
	clientRequestId: "client1",
	agentSessionId: "session1",
	logicalAgentId: "agent1",
	projectRoot: "/repo",
	nonce: "nonce1",
	path: "src"
};
const payload = {
	action: "list",
	controlRequestId: "ctrl1",
	clientRequestId: "client1",
	agentSessionId: "session1",
	logicalAgentId: "agent1",
	projectRoot: "/repo",
	nonce: "nonce1",
	path: "src"
};
const pending = Relay.timeoutEnvelope(expected, 5000, 120000);
assert.equal(pending.ok, true);
assert.equal(pending.status, 202);
assert.equal(pending.state, "accepted_pending");
assert.equal(pending.accepted, true);
assert.equal(pending.durable, true);
assert.equal(pending.terminal, false);
assert.equal(pending.pending, true);
assert.equal(pending.retryable, true);
assert.equal(pending.healthImpact, "none");
assert.equal(pending.next.action, "retryAction");
assert.equal(pending.resumeToken, "ctrl1");
assert.equal(pending.requestAction, "list");
assert.equal(Contract.verifyTunnelResponse(pending, payload, "t1"), pending);

const missing = Relay.missingTunnelEnvelope(expected);
assert.equal(missing.ok, false);
assert.equal(missing.status, 503);
assert.equal(missing.pending, false);
assert.equal(missing.accepted, false);
assert.equal(missing.retryable, true);
assert.equal(Contract.verifyTunnelResponse(missing, payload, "t1"), missing);

const failed = Relay.sendFailureEnvelope("ctrl1", expected, new Error("closed"));
assert.equal(failed.terminal, true);
assert.equal(failed.retryable, false);
assert.equal(Contract.verifyTunnelResponse(failed, payload, "t1"), failed);

console.log(JSON.stringify({
	ok: true,
	suite: "relay-default-clean",
	acceptedPendingExplicit: true,
	unavailableNotPending: true,
	sendFailureTerminal: true
}, null, 2));
