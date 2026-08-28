//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { verifyTunnelResponse } = require("../responseContract.js");

/**
 * @file Proves terminal retry transport identity survives real relay envelope shapes.
 * @description
 * The observer receipt and original deed are distinct keilim carrying one durable truth.
 * Awtsmoos.com must recover the wrapper from semantic or envelope testimony without
 * comparing it to the older deed. The Awtsmoos renews each instant, while a timeout,
 * queue expiry, or late result keeps the identity that actually belongs to it.
 *
 * > The wrapper may change while the deed stays one,
 * > A late witness returns when its travel is done;
 * > The Awtsmoos renews every moon and sun,
 * > So truthful receipts let reconciliation run.
 */

test("terminal retry accepts semantic transport witness with different deed id", () => {
	const result = terminalResult({
		requestSemantics: { controlRequestId: "outer-transport" }
	});
	assert.equal(verifyTunnelResponse(result, retryPayload(), "native-one"), result);
});

test("terminal retry accepts envelope id when semantic receipt is absent", () => {
	const result = terminalResult({ id: "outer-transport" });
	assert.equal(verifyTunnelResponse(result, retryPayload(), "native-one"), result);
});

test("queue-expired terminal truth survives semantic retry correlation", () => {
	const result = terminalResult({
		ok: false,
		status: 503,
		error: "agent_queue_wait_expired",
		consumerStarted: false,
		queueWaitExpired: true,
		acceptanceState: "ACCEPTED",
		safeToRetry: false,
		reconciliationRequired: true,
		requestSemantics: { controlRequestId: "outer-transport" }
	});
	const verified = verifyTunnelResponse(result, retryPayload(), "native-one");
	assert.equal(verified, result);
	assert.equal(verified.status, 503);
	assert.equal(verified.error, "agent_queue_wait_expired");
	assert.equal(verified.reconciliationRequired, true);
});

test("foreign semantic transport witness remains fail-closed", () => {
	const result = terminalResult({
		requestSemantics: { controlRequestId: "foreign-transport" }
	});
	assertMismatch(verifyTunnelResponse(result, retryPayload(), "native-one"));
});

test("terminal retry without transport testimony remains fail-closed", () => {
	const result = terminalResult();
	assertMismatch(verifyTunnelResponse(result, retryPayload(), "native-one"));
});

/** Creates the retry observer whose receipt must never be mistaken for the deed. */
function retryPayload() {
	return {
		action: "retryAction",
		controlRequestId: "outer-transport",
		clientRequestId: "observer-client",
		nonce: "observer-nonce",
		requestedAction: "recentFiles"
	};
}

/** Creates terminal truth whose controlRequestId deliberately belongs to the old deed. */
function terminalResult(extra = {}) {
	return {
		ok: true,
		status: 200,
		action: "recentFiles",
		controlRequestId: "original-deed",
		clientRequestId: "original-client",
		nonce: "original-nonce",
		...extra
	};
}

/** Proves a correlation rejection names the missing or foreign transport witness. */
function assertMismatch(result) {
	assert.equal(result.ok, false);
	assert.equal(result.status, 409);
	assert.equal(result.error, "tunnel_response_correlation_mismatch");
	assert.equal(
		result.mismatchProof.some(item => item.includes("transportReceiptId")),
		true
	);
}
