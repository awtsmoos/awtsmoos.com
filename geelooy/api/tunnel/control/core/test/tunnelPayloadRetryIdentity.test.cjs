// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { buildFsPayload } = require("../tunnelPayload.js");

/**
 * @file Proves retry transport identity can never masquerade as the original deed.
 * @description
 * The Awtsmoos lets a new messenger observe one old deed; Awtsmoos.com therefore
 * preserves an explicitly carried original identity while refusing to invent that
 * identity from a fresh transport receipt. Ordinary requests remain one simple vessel.
 */
proveExplicitOriginalRetry();
proveTransportOnlyRetry();
proveOrdinaryIdentity();
console.log(JSON.stringify({ ok: true, suite: "tunnel-payload-retry-identity" }));

/** Preserves a genuinely explicit original deed carried inside retry parameters. */
function proveExplicitOriginalRetry() {
	const payload = buildFsPayload(request({
		controlRequestId: "outer-transport",
		params: {
			requestId: "request-original",
			controlRequestId: "original-control",
			originalControlRequestId: "original-control",
			clientRequestId: "original-client",
			nonce: "original-nonce",
			requestedAction: "list",
			logicalAgentId: "agent-seven",
			agentSessionId: "session-seven",
			generation: 7
		}
	}));
	assert.equal(payload.action, "retryAction");
	assert.equal(payload.controlRequestId, "original-control");
	assert.equal(payload.originalControlRequestId, "original-control");
	assert.equal(payload.requestId, "request-original");
	assert.equal(payload.generation, 7);
}

/** Keeps the outer retry receipt as transport without fabricating an original deed. */
function proveTransportOnlyRetry() {
	const payload = buildFsPayload(request({
		controlRequestId: "outer-transport",
		clientRequestId: "outer-client",
		requestedAction: "commandStart"
	}));
	assert.equal(payload.action, "retryAction");
	assert.equal(payload.controlRequestId, "outer-transport");
	assert.equal(payload.originalControlRequestId, undefined);
	assert.equal(payload.requestedAction, "commandStart");
}

/** Keeps ordinary request identity simple by mirroring its single canonical deed. */
function proveOrdinaryIdentity() {
	const payload = buildFsPayload({
		paramKinds: {
			POST: {
				action: "read",
				controlRequestId: "ordinary-control"
			},
			GET: {}
		}
	});
	assert.equal(payload.controlRequestId, "ordinary-control");
	assert.equal(payload.originalControlRequestId, "ordinary-control");
}

function request(post = {}) {
	return {
		paramKinds: {
			POST: { action: "retryAction", ...post },
			GET: {}
		}
	};
}
