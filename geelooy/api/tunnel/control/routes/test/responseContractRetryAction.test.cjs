// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const {
	expectedResponseAction,
	isPending,
	verifyTunnelResponse
} = require("../fsVessel/responseContract.js");

/**
	* @file Proves retry polling preserves accepted waiting and terminal correlation.
	* @description The Awtsmoos renews waiting without turning waiting into failure.
	*/
const payload = {
	action: "retryAction",
	requestedAction: "write",
	controlRequestId: "retry-control",
	clientRequestId: "client-proof",
	nonce: "nonce-proof"
};

const recovered = {
	ok: true,
	action: "write",
	requestAction: "write",
	controlRequestId: "retry-control",
	clientRequestId: "client-proof",
	nonce: "nonce-proof",
	path: "vessel.txt",
	recoveredAfterRestart: true
};

const pending = {
	ok: true,
	status: 202,
	state: "accepted_pending",
	accepted: true,
	durable: true,
	terminal: false,
	pending: true,
	retryable: true,
	healthImpact: "none",
	action: "tunnelRequestPending",
	requestedAction: "write",
	controlRequestId: "retry-control",
	clientRequestId: "client-proof",
	nonce: "nonce-proof",
	resumeToken: "retry-control"
};

assert.equal(expectedResponseAction(payload), "write");
assert.equal(isPending(pending), true);
assert.equal(verifyTunnelResponse(pending, payload, "awt-proof"), pending);
assert.equal(verifyTunnelResponse(recovered, payload, "awt-proof"), recovered);
assert.equal(verifyTunnelResponse({
	...pending,
	requestedAction: "deleteFile"
}, payload, "awt-proof").error, "tunnel_response_correlation_mismatch");
assert.equal(verifyTunnelResponse({
	...recovered,
	controlRequestId: "wrong-control"
}, payload, "awt-proof").error, "tunnel_response_correlation_mismatch");
assert.equal(verifyTunnelResponse({
	...recovered,
	nonce: "wrong-nonce"
}, payload, "awt-proof").error, "tunnel_response_correlation_mismatch");
assert.match(
	verifyTunnelResponse({
		...recovered,
		action: "deleteFile",
		requestAction: "deleteFile"
	}, payload, "awt-proof").mismatchProof.join(" "),
	/requestAction expected write got deleteFile/
);

console.log(JSON.stringify({
	ok: true,
	suite: "response-contract-retry-action",
	acceptedPendingWrite: true,
	terminalWriteAccepted: true,
	wrongIdentitiesRejected: true
}, null, 2));
