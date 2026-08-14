// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-response-seal-"));
process.env.AWTSMOOS_INSTALL_ROOT = root;
fs.writeFileSync(path.join(root, "config.json"), JSON.stringify({
	tunnelName: "awt-response-seal",
	root
}));

const Envelope = require("../lib/runtime/envelope.js");
const ResponseSize = require("../lib/response-size.js");
const Generation = require(
	"../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/responseGeneration.js"
);
const Validation = require(
	"../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/validation.js"
);

/**
 * @file Proves ordinary and spilled responses preserve every settlement field.
 * @description Awtsmoos.com keeps generation, command job, and stream identity
 * across response compaction so exact durable testimony can be acknowledged.
 */
try {
	const origin = "4:test:tun_response_seal";
	const payload = requestPayload(root, origin);
	const response = Envelope.responseEnvelope(
		{ id: "transport-response-seal" },
		payload,
		{ ok: true, action: "commandJobOutputPage", content: "ready" },
		Date.now(),
		() => ({ inflight: 0, queued: 0 })
	);
	assert.equal(response.originRegistrationKey, origin);
	assert.equal(response.controlRequestId, payload.controlRequestId);
	assert.equal(response.clientRequestId, payload.clientRequestId);
	assert.equal(response.nonce, payload.nonce);
	assert.equal(response.jobId, payload.jobId);
	assert.equal(response.stream, "stdout");

	const small = ResponseSize.compactForSend(root, response, { limitBytes: 16384 });
	assert.equal(small.spilled, false);
	assert.strictEqual(small.envelope, response);

	const large = {
		...response,
		content: "x".repeat(100000),
		results: Array.from({ length: 1000 }, (_, index) => ({ index, payload: "y".repeat(80) }))
	};
	const spilled = ResponseSize.compactForSend(root, large, { limitBytes: 16384 });
	assert.equal(spilled.spilled, true);
	assert.equal(spilled.envelope.originRegistrationKey, origin);
	assert.equal(spilled.envelope.controlRequestId, payload.controlRequestId);
	assert.equal(spilled.envelope.clientRequestId, payload.clientRequestId);
	assert.equal(spilled.envelope.projectRoot, root);
	assert.equal(spilled.envelope.nonce, payload.nonce);
	assert.equal(spilled.envelope.jobId, payload.jobId);
	assert.equal(spilled.envelope.stream, "stdout");
	assert.equal(spilled.envelope.requestAction, "commandJobOutputPage");
	assert.equal(spilled.envelope.content, undefined);
	assert.equal(spilled.envelope.results, undefined);
	assert.ok(spilled.bytes < 16384, `spill envelope too large: ${spilled.bytes}`);

	const expected = requestExpectation(root, origin, payload);
	assert.equal(Validation.validateTunnelResponse(expected, spilled.envelope).ok, true);
	const record = { expected };
	const client = { registrationKey: "new-generation", tunnelId: "tun_response_seal" };
	assert.equal(Generation.sameImmutableTunnel(record, client, spilled.envelope), true);
	console.log(JSON.stringify({ ok: true, suite: "response-transport-correlation", spilledBytes: spilled.bytes }));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function requestPayload(projectRoot, originRegistrationKey) {
	return {
		action: "commandJobOutputPage",
		requestedTunnelName: "awt-response-seal",
		controlRequestId: "req-response-seal",
		clientRequestId: "client-response-seal",
		originRegistrationKey,
		projectRoot,
		nonce: "nonce-response-seal",
		jobId: "cmdjob-response-seal",
		stream: "stdout",
		routeReference: "tun_response_seal",
		targetVessel: "native-tunnel"
	};
}

function requestExpectation(projectRoot, registrationKey, payload) {
	return {
		registrationKey,
		tunnelName: "awt-response-seal",
		requestedAction: payload.action,
		controlRequestId: payload.controlRequestId,
		clientRequestId: payload.clientRequestId,
		projectRoot,
		nonce: payload.nonce,
		jobId: payload.jobId,
		stream: payload.stream,
		routeReference: payload.routeReference
	};
}
