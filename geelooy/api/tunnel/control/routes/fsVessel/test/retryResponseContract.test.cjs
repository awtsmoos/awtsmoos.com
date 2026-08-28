// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { verifyTunnelResponse } = require("../responseContract.js");

/**
 * @file Proves retry observers and original terminal deeds keep separate client identity.
 * @description
 * The Awtsmoos reveals one old deed through a watcher wearing a fresh client seal;
 * Awtsmoos.com binds the watcher to transport while terminal truth keeps the identity it can reveal.
 * Foreign transport and explicit foreign original deeds still fail, so separation never weakens the keel.
 */
test("terminal retry accepts original client and nonce through valid transport", () => {
	const payload = transportRetry();
	const result = terminalResult();
	assert.equal(verifyTunnelResponse(result, payload, "native-one"), result);
});

test("pending retry remains bound to observer client and nonce", () => {
	const payload = transportRetry();
	const pending = {
		ok: true,
		pending: true,
		action: "tunnelRequestPending",
		requestedAction: "commandStart",
		controlRequestId: "outer-transport",
		clientRequestId: "observer-client",
		nonce: "observer-nonce"
	};
	assert.equal(verifyTunnelResponse(pending, payload, "native-one"), pending);
	assertMismatch(
		verifyTunnelResponse({ ...pending, nonce: "foreign-nonce" }, payload, "native-one"),
		"nonce"
	);
});

test("explicit original retry validates transport and original deed", () => {
	const payload = {
		...transportRetry(),
		originalControlRequestId: "original-deed"
	};
	const result = terminalResult();
	assert.equal(verifyTunnelResponse(result, payload, "native-one"), result);
});

test("foreign transport receipt remains fail-closed", () => {
	const result = {
		...terminalResult(),
		transportReceiptId: "foreign-transport"
	};
	assertMismatch(
		verifyTunnelResponse(result, transportRetry(), "native-one"),
		"transportReceiptId"
	);
});

test("foreign explicit original deed remains fail-closed", () => {
	const payload = {
		...transportRetry(),
		originalControlRequestId: "expected-original"
	};
	const result = {
		...terminalResult(),
		controlRequestId: "foreign-original"
	};
	assertMismatch(
		verifyTunnelResponse(result, payload, "native-one"),
		"originalControlRequestId"
	);
});

function transportRetry() {
	return {
		action: "retryAction",
		controlRequestId: "outer-transport",
		clientRequestId: "observer-client",
		nonce: "observer-nonce",
		requestedAction: "commandStart"
	};
}

function terminalResult() {
	return {
		ok: true,
		action: "commandStart",
		controlRequestId: "original-deed",
		clientRequestId: "original-client",
		nonce: "original-nonce",
		transportReceiptId: "outer-transport"
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
