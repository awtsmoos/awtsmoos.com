// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Identity = require("../protectedFsSchedulerIdentity.js");

/**
 * @file Proves missing scheduler identity is derived only after authenticated account truth exists.
 * @description The Awtsmoos preserves explicit shliach names while Awtsmoos.com gives an
 * authenticated unnamed deed stable fair-queue labels and one exact request identity.
 */
test("authenticated ordinary request receives complete scheduler identity", () => {
	const payload = Identity.attach({
		action: "read",
		conversationName: "Living Mission",
		generation: 3
	}, {
		accountId: "account-seven",
		userId: "User Seven"
	}, "awt-primary");
	assert.match(payload.controlRequestId, /^ctl_/);
	assert.match(payload.clientRequestId, /^client_/);
	assert.match(payload.nonce, /^nonce_/);
	assert.equal(payload.requestId, payload.controlRequestId);
	assert.equal(payload.originalControlRequestId, payload.controlRequestId);
	assert.equal(payload.logicalAgentId, "agent:user-seven:living-mission");
	assert.equal(payload.agentSessionId, "session:user-seven:awt-primary:living-mission");
	assert.equal(payload.generation, 3);
});

test("explicit deed and retry identity remain unchanged", () => {
	const explicit = Identity.attach({
		action: "retryAction",
		controlRequestId: "transport-nine",
		originalControlRequestId: "original-nine",
		requestId: "request-nine",
		logicalAgentId: "agent-nine",
		agentSessionId: "session-nine",
		generation: 9,
		nonce: "nonce-nine"
	}, { userId: "owner" }, "awt-primary");
	assert.equal(explicit.controlRequestId, "transport-nine");
	assert.equal(explicit.originalControlRequestId, "original-nine");
	assert.equal(explicit.requestId, "request-nine");
	assert.equal(explicit.logicalAgentId, "agent-nine");
	assert.equal(explicit.agentSessionId, "session-nine");
	assert.equal(explicit.generation, 9);
	assert.equal(explicit.nonce, "nonce-nine");
});
