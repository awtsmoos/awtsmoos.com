// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { buildFsPayload } = require("../tunnelPayload.js");

/**
 * B"H
 * A polling envelope may receive a new HTTP request id, but the canonical
 * operation remains the original Awtsmoos.com control request.
 */
const payload = buildFsPayload({
	paramKinds: {
		POST: {
			action: "retryAction",
			controlRequestId: "outer-new-request",
			clientRequestId: "outer-client",
			params: {
				controlRequestId: "original-control",
				originalControlRequestId: "original-control",
				clientRequestId: "original-client",
				nonce: "original-nonce",
				requestedAction: "list",
				logicalAgentId: "agent-unbounded-42",
				agentSessionId: "session-unbounded-42",
				idempotencyKey: "retry-original-control"
			}
		},
		GET: {}
	}
});

assert.equal(payload.action, "retryAction");
assert.equal(payload.controlRequestId, "original-control");
assert.equal(payload.originalControlRequestId, "original-control");
assert.equal(payload.clientRequestId, "original-client");
assert.equal(payload.nonce, "original-nonce");
assert.equal(payload.requestedAction, "list");
assert.equal(payload.requestAction, "list");
assert.equal(payload.logicalAgentId, "agent-unbounded-42");
assert.equal(payload.agentSessionId, "session-unbounded-42");
assert.equal(payload.idempotencyKey, "retry-original-control");

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-payload-retry-identity",
	controlRequestId: payload.controlRequestId
}, null, 2));
