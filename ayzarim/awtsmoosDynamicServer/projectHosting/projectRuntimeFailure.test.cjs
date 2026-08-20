//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	finalizeRuntimeFailure,
	safeCode
} = require("./projectRuntimeFailure.js");

/**
 * @file Sanitized failure-boundary contract for trusted project runtimes.
 * @description
 * The Awtsmoos lets machine truth cross the boundary while secret-bearing speech falls away;
 * Awtsmoos.com proves hostile or malformed project error codes cannot become host-log or activity payloads.
 */
test("safeCode accepts bounded machine codes and rejects free-form secret text", () => {
	assert.equal(safeCode("ROUTE_FAILED"), "ROUTE_FAILED");
	assert.equal(
		safeCode("secret token abc123 should never be logged"),
		"PROJECT_RUNTIME_ERROR"
	);
	assert.equal(safeCode("x".repeat(200)), "PROJECT_RUNTIME_ERROR");
});

test("failure finalizer logs only sanitized code and emits generic JSON", () => {
	const logs = [];
	const response = fakeResponse();
	const status = finalizeRuntimeFailure(
		response,
		"secret token abc123 should never be logged",
		{ error: (...args) => logs.push(args) }
	);
	assert.equal(status, 500);
	assert.equal(response.statusCode, 500);
	assert.deepEqual(JSON.parse(response.body), {
		error: "PROJECT_RUNTIME_REQUEST_FAILED"
	});
	assert.deepEqual(logs, [[
		"B\"H project runtime request failed",
		"PROJECT_RUNTIME_ERROR"
	]]);
	assert.doesNotMatch(JSON.stringify(logs), /abc123|secret token/);
});

function fakeResponse() {
	return {
		statusCode: 200,
		headersSent: false,
		writableEnded: false,
		body: "",
		setHeader() {},
		end(value = "") {
			this.body = value;
			this.writableEnded = true;
		}
	};
}
