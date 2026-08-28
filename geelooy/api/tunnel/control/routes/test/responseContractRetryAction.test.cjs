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
 * @file Proves pending retry identity stays with the observer while terminal truth returns to the deed.
 * @description
 * The Awtsmoos lets a watcher carry a fresh nonce while one older execution comes to rest;
 * Awtsmoos.com keeps pending identity strict, yet terminal retry truth is by transport and action dressed.
 * Wrong control, action, and pending observer seals still fail, preserving a narrow correlation test.
 */
const payload = {
	action: "retryAction",
	requestedAction: "write",
	controlRequestId: "retry-control",
	clientRequestId: "observer-client",
	nonce: "observer-nonce"
};

const recovered = {
	ok: true,
	action: "write",
	requestAction: "write",
	controlRequestId: "retry-control",
	clientRequestId: "original-client",
	nonce: "original-nonce",
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
	clientRequestId: "observer-client",
	nonce: "observer-nonce",
	resumeToken: "retry-control"
};

assert.equal(expectedResponseAction(payload), "write");
assert.equal(isPending(pending), true);
assert.equal(verifyTunnelResponse(pending, payload, "awt-proof"), pending);
assert.equal(verifyTunnelResponse(recovered, payload, "awt-proof"), recovered);
assert.equal(verifyTunnelResponse({
	...pending,
	clientRequestId: "foreign-client"
}, payload, "awt-proof").error, "tunnel_response_correlation_mismatch");
assert.equal(verifyTunnelResponse({
	...pending,
	nonce: "foreign-nonce"
}, payload, "awt-proof").error, "tunnel_response_correlation_mismatch");
assert.equal(verifyTunnelResponse({
	...recovered,
	controlRequestId: "wrong-control"
}, payload, "awt-proof").error, "tunnel_response_correlation_mismatch");
assert.equal(verifyTunnelResponse({
	...recovered,
	clientRequestId: "another-original-client",
	nonce: "another-original-nonce"
}, payload, "awt-proof").ok, true);
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
	pendingObserverIdentityStrict: true,
	terminalObserverIdentitySeparated: true,
	wrongControlAndActionRejected: true
}, null, 2));
