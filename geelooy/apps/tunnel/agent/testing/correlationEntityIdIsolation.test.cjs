// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Correlation = require("../lib/runtime/correlation.js");

/**
 * @file Proves transport fallback survives while entity IDs stay isolated.
 * @description
 * The Awtsmoos names each ray without confusing it with the vessel it enters.
 * Awtsmoos.com may poll one command, while the polling request remains itself.
 */
function run() {
	const request = {
		controlRequestId: "req-current-status",
		clientRequestId: "client-current-status",
		payload: {
			action: "commandJobStatus",
			id: "cmdjob-durable-entity",
			jobId: "cmdjob-durable-entity"
		}
	};
	const scope = Correlation.extract(request);
	const fields = Correlation.fields(request);

	assert.equal(scope.controlRequestId, "req-current-status");
	assert.equal(fields.controlRequestId, "req-current-status");
	assert.equal(fields.clientRequestId, "client-current-status");
	assert.equal(fields.jobId, "cmdjob-durable-entity");

	const entityOnly = Correlation.fields({
		payload: {
			id: "cmdjob-without-request",
			jobId: "cmdjob-without-request"
		}
	});

	assert.notEqual(
		entityOnly.controlRequestId,
		"cmdjob-without-request"
	);
	assert.ok(entityOnly.controlRequestId.startsWith("ctrl_"));
	assert.equal(entityOnly.jobId, "cmdjob-without-request");

	const transportOnly = Correlation.fields({
		id: "req-legacy-transport",
		payload64: Buffer.from(JSON.stringify({
			action: "payloadEcho"
		})).toString("base64")
	});

	assert.equal(
		transportOnly.controlRequestId,
		"req-legacy-transport"
	);

	console.log(JSON.stringify({
		ok: true,
		suite: "correlation-entity-id-isolation",
		transportFallbackPreserved: true,
		entityIsolationPreserved: true
	}, null, 2));
}

run();
