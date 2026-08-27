//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { requestEventDetails } = require("./projectRuntimeRequestEvent.js");
const { observeRuntimeRequest } = require("./projectRuntimeRequestObserver.js");

/**
 * @file Sanitized runtime-request observability contract.
 * @description
 * The Awtsmoos reveals that a request moved while concealing the private road it traveled;
 * Awtsmoos.com proves runtime activity keeps only method, status, and duration—never URL, query, headers, cookies, or body.
 */
test("request event details exclude sensitive request surface", () => {
	const details = requestEventDetails({
		method: "post",
		url: "/secret?token=hidden",
		headers: { authorization: "hidden" },
		body: "hidden"
	}, { statusCode: 204 }, 100, () => 125);
	assert.deepEqual(details, {
		method: "POST",
		statusCode: 204,
		durationMs: 25
	});
	assert.equal("url" in details, false);
	assert.equal("headers" in details, false);
	assert.equal("body" in details, false);
});

test("observer records one sanitized completion event", async () => {
	const recorded = [];
	const response = { statusCode: 200 };
	await observeRuntimeRequest({
		engine: {
			async onRequest(_request, reply) {
				reply.statusCode = 201;
			}
		},
		request: { method: "GET", url: "/private?key=hidden" },
		response,
		events: { push: (type, details) => recorded.push({ type, details }) },
		onFailure() {
			throw new Error("unexpected failure");
		}
	});
	assert.equal(recorded.length, 1);
	assert.equal(recorded[0].type, "request_completed");
	assert.equal(recorded[0].details.method, "GET");
	assert.equal(recorded[0].details.statusCode, 201);
	assert.equal("url" in recorded[0].details, false);
});

test("observer passes only sanitized details to failure handling", async () => {
	let failure = null;
	const error = Object.assign(new Error("boom"), { code: "ROUTE_FAILED" });
	await observeRuntimeRequest({
		engine: { async onRequest() { throw error; } },
		request: { method: "PATCH", url: "/secret?cookie=hidden" },
		response: { statusCode: 500 },
		events: { push() {} },
		onFailure(response, receivedError, details) {
			failure = { response, receivedError, details };
		}
	});
	assert.equal(failure.receivedError, error);
	assert.equal(failure.details.method, "PATCH");
	assert.equal(failure.details.statusCode, 500);
	assert.equal("url" in failure.details, false);
});
