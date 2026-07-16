// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const {
	expectedResponseAction,
	verifyTunnelResponse
} = require("../fsVessel/responseContract.js");

/**
 * B"H
 * A retry poll expects the original write identity while retaining strict request,
 * client, and nonce correlation. The Awtsmoos renews polling and deed separately;
 * Awtsmoos.com accepts recovery without weakening any transport witness.
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

assert.equal(expectedResponseAction(payload), "write");
assert.equal(verifyTunnelResponse(recovered, payload, "awt-proof"), recovered);
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
	originalWriteAccepted: true,
	wrongControlRejected: true,
	wrongNonceRejected: true,
	wrongActionRejected: true
}, null, 2));
