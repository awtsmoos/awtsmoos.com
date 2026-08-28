//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { verifyTunnelResponse } = require("../responseContract.js");

/**
 * @file Proves retry correlation against the terminal envelopes emitted under pressure.
 * @description
 * The Awtsmoos keeps the messenger distinct from the deed the messenger bears;
 * Awtsmoos.com must read transport testimony where the runtime actually declares.
 * A queue-expired witness may carry no synthetic transportReceiptId at all,
 * yet outer response identity still guards the original deed from a foreign call.
 */
test("terminal retry accepts runtime requestSemantics transport witness", () => {
	const result = runtimeTerminal({
		requestSemantics: {
			controlRequestId: "outer-transport"
		}
	});

	assert.equal(
		verifyTunnelResponse(result, transportRetry(), "native-one"),
		result
	);
});

test("terminal retry accepts outer response id transport witness", () => {
	const result = runtimeTerminal({
		id: "outer-transport",
		requestSemantics: undefined
	});

	assert.equal(
		verifyTunnelResponse(result, transportRetry(), "native-one"),
		result
	);
});

test("runtime terminal retry rejects foreign transport testimony", () => {
	const result = runtimeTerminal({
		requestSemantics: {
			controlRequestId: "foreign-transport"
		}
	});
	const checked = verifyTunnelResponse(result, transportRetry(), "native-one");

	assert.equal(checked.ok, false);
	assert.equal(checked.status, 409);
	assert.equal(checked.error, "tunnel_response_correlation_mismatch");
	assert.equal(
		checked.mismatchProof.some(item => item.includes("transportReceiptId")),
		true
	);
});

test("runtime retry still validates an explicit original deed", () => {
	const payload = {
		...transportRetry(),
		originalControlRequestId: "original-client-deed"
	};
	const result = runtimeTerminal();

	assert.equal(verifyTunnelResponse(result, payload, "native-one"), result);
});

function transportRetry() {
	return {
		action: "retryAction",
		controlRequestId: "outer-transport",
		requestedAction: "commandJobOutputPage",
		jobId: "job-one",
		stream: "stdout"
	};
}

function runtimeTerminal(overrides = {}) {
	return {
		id: "outer-transport",
		controlRequestId: "original-client-deed",
		clientRequestId: "original-client-deed",
		jobId: "job-one",
		stream: "stdout",
		ok: false,
		status: 503,
		error: "agent_queue_wait_expired",
		consumerStarted: false,
		safeToRetry: false,
		reconciliationRequired: true,
		requestSemantics: {
			controlRequestId: "outer-transport"
		},
		...overrides
	};
}
