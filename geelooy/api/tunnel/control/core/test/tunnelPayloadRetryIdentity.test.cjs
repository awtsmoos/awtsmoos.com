// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { buildFsPayload } = require("../tunnelPayload.js");

/**
 * @file Proves retries preserve one exact Awtsmoos.com request and agent generation.
 * @description
 * The Awtsmoos lets a polling envelope be new while the deed remains one. Identity
 * fields must survive retry unchanged so accepted mutations are reconciled, not replayed.
 */
const payload = buildFsPayload({
	paramKinds: {
		POST: {
			action: "retryAction",
			controlRequestId: "outer-new-request",
			clientRequestId: "outer-client",
			params: {
				requestId: "request-original",
				controlRequestId: "original-control",
				originalControlRequestId: "original-control",
				clientRequestId: "original-client",
				nonce: "original-nonce",
				requestedAction: "list",
				logicalAgentId: "agent-unbounded-42",
				agentSessionId: "session-unbounded-42",
				generation: 7,
				spawnGroupId: "spawn-alpha",
				predecessorAgentId: "agent-old",
				idempotencyKey: "retry-original-control"
			}
		},
		GET: {}
	}
});

assert.equal(payload.action, "retryAction");
assert.equal(payload.requestId, "request-original");
assert.equal(payload.controlRequestId, "original-control");
assert.equal(payload.originalControlRequestId, "original-control");
assert.equal(payload.clientRequestId, "original-client");
assert.equal(payload.nonce, "original-nonce");
assert.equal(payload.requestedAction, "list");
assert.equal(payload.requestAction, "list");
assert.equal(payload.logicalAgentId, "agent-unbounded-42");
assert.equal(payload.agentSessionId, "session-unbounded-42");
assert.equal(payload.generation, 7);
assert.equal(payload.spawnGroupId, "spawn-alpha");
assert.equal(payload.predecessorAgentId, "agent-old");
assert.equal(payload.idempotencyKey, "retry-original-control");

console.log(JSON.stringify({ ok: true, suite: "tunnel-payload-retry-identity",
	controlRequestId: payload.controlRequestId, requestId: payload.requestId, generation: payload.generation }, null, 2));
