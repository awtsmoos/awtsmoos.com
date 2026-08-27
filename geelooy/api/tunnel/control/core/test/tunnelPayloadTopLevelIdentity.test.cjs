// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { buildFsPayload } = require("../tunnelPayload.js");

/**
 * @file Proves first-class request identity survives from top-level control input.
 * @description
 * The Awtsmoos gives every deed its own unborrowed name; Awtsmoos.com must preserve
 * request, logical agent, session, and generation without requiring a hidden carrier frame.
 */
const payload = buildFsPayload({
	paramKinds: {
		POST: {
			action: "agentDoctor",
			requestId: "top-level-request",
			controlRequestId: "top-level-control",
			clientRequestId: "top-level-client",
			logicalAgentId: "top-level-agent",
			agentSessionId: "top-level-session",
			generation: 9
		},
		GET: {}
	}
});

assert.equal(payload.action, "agentDoctor");
assert.equal(payload.requestId, "top-level-request");
assert.equal(payload.controlRequestId, "top-level-control");
assert.equal(payload.clientRequestId, "top-level-client");
assert.equal(payload.logicalAgentId, "top-level-agent");
assert.equal(payload.agentSessionId, "top-level-session");
assert.equal(payload.generation, 9);

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-payload-top-level-identity",
	requestId: payload.requestId,
	logicalAgentId: payload.logicalAgentId,
	generation: payload.generation
}));
