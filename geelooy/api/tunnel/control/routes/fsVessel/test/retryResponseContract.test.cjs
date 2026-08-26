// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { verifyTunnelResponse } = require("../responseContract.js");

/**
 * @file Proves retry transport receipts and original deeds remain separate witnesses.
 * @description
 * The Awtsmoos reveals one deed through a new messenger; Awtsmoos.com binds the
 * messenger to transportReceiptId and binds an original deed only when the caller
 * explicitly carried that original testimony. Foreign explicit identity still fails.
 */
test("transport-only retry accepts the original native deed", () => {
	const payload = transportRetry();
	const result = {
		ok: true,
		action: "commandStart",
		controlRequestId: "original-deed",
		transportReceiptId: "outer-transport"
	};
	assert.equal(verifyTunnelResponse(result, payload, "native-one"), result);
});

test("explicit original retry validates both witnesses", () => {
	const payload = {
		...transportRetry(),
		originalControlRequestId: "original-deed"
	};
	const result = {
		ok: true,
		action: "commandStart",
		controlRequestId: "original-deed",
		transportReceiptId: "outer-transport"
	};
	assert.equal(verifyTunnelResponse(result, payload, "native-one"), result);
});

test("foreign transport receipt remains fail-closed", () => {
	const result = {
		ok: true,
		action: "commandStart",
		controlRequestId: "original-deed",
		transportReceiptId: "foreign-transport"
	};
	const verified = verifyTunnelResponse(result, transportRetry(), "native-one");
	assertMismatch(verified, "transportReceiptId");
});

test("foreign explicit original deed remains fail-closed", () => {
	const payload = {
		...transportRetry(),
		originalControlRequestId: "expected-original"
	};
	const result = {
		ok: true,
		action: "commandStart",
		controlRequestId: "foreign-original",
		transportReceiptId: "outer-transport"
	};
	const verified = verifyTunnelResponse(result, payload, "native-one");
	assertMismatch(verified, "originalControlRequestId");
});

function transportRetry() {
	return {
		action: "retryAction",
		controlRequestId: "outer-transport",
		requestedAction: "commandStart"
	};
}

function assertMismatch(result, field) {
	assert.equal(result.ok, false);
	assert.equal(result.status, 409);
	assert.equal(result.error, "tunnel_response_correlation_mismatch");
	assert.equal(
		result.mismatchProof.some(item => item.includes(field)),
		true
	);
}
