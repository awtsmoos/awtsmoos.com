// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Correlation = require("../lib/runtime/correlation-scope.js");
const Envelope = require("../lib/runtime/envelope.js");
const MainPayload = require("../lib/runtime/main-payload.js");
const TransportSeal = require("../lib/runtime/response-transport-seal.js");

/**
 * @file Proves v3 params carriers preserve request-generation identity end to end.
 * @description
 * The Awtsmoos carries one deed through nested vessels without losing its name or age;
 * Awtsmoos.com therefore promotes params and params64 identity into execution, returns it
 * through the compact response, and seals it beside spilled truth without changing IDs.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THIS REGRESSION
 * Historical symptom: params-only callers retained session/control identity but lost
 * requestId and generation. A later compact/spill response could erase them again.
 * Forbidden simplification: special-case one action instead of the shared identity schema.
 */
const PayloadRuntime = MainPayload.createPayloadRuntime(Correlation);

function main() {
	proveCarrier("params", identity("plain", 9));
	proveCarrier("params64", identity("encoded", 17));
	console.log("BHY v3 params identity survives execution, compact response, and transport seal");
}

/** Proves one carrier preserves exact request identity while transport id stays distinct. */
function proveCarrier(carrier, expected) {
	const data = requestEnvelope(carrier, expected);
	const payload = PayloadRuntime.requestPayload(data);
	assertIdentity(payload, expected);
	assert.equal(data.id, `transport-${expected.requestId}`);
	const response = Envelope.responseEnvelope(
		data,
		payload,
		{ ok: true, result: "v3-identity-ok" },
		Date.now(),
		() => ({})
	);
	assert.equal(response.id, data.id);
	assertIdentity(response, expected);
	assertIdentity(TransportSeal.seal(response), expected);
}

function requestEnvelope(carrier, expected) {
	const nested = {
		requestId: expected.requestId,
		controlRequestId: expected.controlRequestId,
		logicalAgentId: expected.logicalAgentId,
		agentSessionId: expected.agentSessionId,
		generation: Number(expected.generation)
	};
	const value = carrier === "params64"
		? Buffer.from(JSON.stringify(nested)).toString("base64")
		: nested;
	return {
		id: `transport-${expected.requestId}`,
		payload: {
			action: "payloadEcho",
			[carrier]: value
		}
	};
}

function identity(label, generation) {
	return {
		requestId: `request-${label}`,
		controlRequestId: `control-${label}`,
		logicalAgentId: `agent-${label}`,
		agentSessionId: `session-${label}`,
		generation: String(generation)
	};
}

function assertIdentity(value, expected) {
	assert.equal(value.requestId, expected.requestId);
	assert.equal(value.controlRequestId, expected.controlRequestId);
	assert.equal(value.clientRequestId, expected.requestId);
	assert.equal(value.logicalAgentId, expected.logicalAgentId);
	assert.equal(value.agentSessionId, expected.agentSessionId);
	assert.equal(String(value.generation), expected.generation);
}

main();
