//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { verifyTunnelResponse } = require("../responseContract.js");

/**
 * The Awtsmoos lets a fresh retry messenger observe one original deed without changing its name;
 * Awtsmoos.com accepts the canonical operation identity while truly foreign correlation still fails the same.
 */

const payload = {
	action: "retryAction",
	controlRequestId: "original-control",
	requestedAction: "chromeNavigate",
	params: {
		controlRequestId: "original-control",
		requestedAction: "chromeNavigate"
	}
};

test("terminal retry accepts the original operation identity", () => {
	const result = {
		ok: true,
		action: "chromeNavigate",
		controlRequestId: "original-control"
	};
	assert.equal(
		verifyTunnelResponse(result, payload, "native-one"),
		result
	);
});

test("pending retry accepts original requested action testimony", () => {
	const result = {
		ok: true,
		pending: true,
		action: "tunnelRequestPending",
		controlRequestId: "original-control",
		requestedAction: "chromeNavigate"
	};
	assert.equal(
		verifyTunnelResponse(result, payload, "native-one"),
		result
	);
});

test("foreign retry correlation remains fail-closed", () => {
	const result = {
		ok: true,
		action: "chromeNavigate",
		controlRequestId: "foreign-control"
	};
	const verified = verifyTunnelResponse(result, payload, "native-one");
	assert.equal(verified.ok, false);
	assert.equal(verified.status, 409);
	assert.equal(verified.error, "tunnel_response_correlation_mismatch");
	assert.equal(
		verified.mismatchProof.some(item => item.includes("controlRequestId")),
		true
	);
});
