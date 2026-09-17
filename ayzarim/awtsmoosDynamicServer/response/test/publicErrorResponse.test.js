//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PublicErrorResponseTest
 * @description
 * The Awtsmoos tests the public boundary of Awtsmoos.com: truthful failure
 * status may pass outward, while hidden roots, stacks, logs, and route traces
 * remain inside the server vessel.
 */
const assert = require("node:assert/strict");
const test = require("node:test");
const { errorMessage } = require("../../utils.js");

/**
 * @param {number} statusCode Initial response status.
 * @returns {object} Minimal Node response recorder.
 */
function createResponse(statusCode = 200) {
	return {
		statusCode,
		headers: {},
		body: "",
		endCount: 0,
		setHeader(name, value) {
			this.headers[String(name).toLowerCase()] = value;
		},
		end(body) {
			this.endCount += 1;
			this.body = String(body || "");
		}
	};
}

/**
 * @param {*} failure Failure value supplied by an existing dynamic-server caller.
 * @param {number} statusCode Initial response status.
 * @returns {{response: object, payload: object}} Captured public response.
 */
function captureFailure(failure, statusCode = 200) {
	const response = createResponse(statusCode);
	const handled = errorMessage({ dependencies: { response } }, failure);
	assert.equal(handled, true);
	assert.equal(response.endCount, 1);
	return { response, payload: JSON.parse(response.body) };
}

test("explicit route status survives while internal diagnostics are removed", () => {
	const { response, payload } = captureFailure({
		statusCode: 404,
		message: "Invalid Route",
		code: "INVALID_ROUTE",
		more: { path: "/mnt/private/repo", logs: ["/Users/private"] },
		error: { stack: "at /Users/private/server.js:1:1" }
	});
	assert.equal(response.statusCode, 404);
	assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
	assert.deepEqual(payload, {
		BH: "B\"H",
		error: { message: "Invalid Route", code: "INVALID_ROUTE", statusCode: 404 }
	});
	assert.ok(!response.body.includes("/mnt/"));
	assert.ok(!response.body.includes("/Users/"));
	assert.ok(!response.body.includes("stack"));
});

test("known codes set truthful HTTP status without adding body status", () => {
	const missing = captureFailure({ message: "Missing", code: "NOT_FOUND" });
	const crashed = captureFailure({ message: "Crashed", code: "ROUTE_ERROR" });
	assert.equal(missing.response.statusCode, 404);
	assert.equal(crashed.response.statusCode, 500);
	assert.equal("statusCode" in missing.payload.error, false);
});

test("existing failure status survives while unmapped details are hidden", () => {
	const failure = { message: "secret /Users/private", code: "TEAPOT" };
	const { response, payload } = captureFailure(failure, 418);
	assert.equal(response.statusCode, 418);
	assert.deepEqual(payload.error, {
		message: "Internal server error",
		code: "INTERNAL_SERVER_ERROR"
	});
	assert.ok(!response.body.includes("/Users/"));
});

test("private and string failures become generic public 404 responses", () => {
	const privateRoute = captureFailure({ message: "Private", code: "PRIVATE_ROUTE" });
	const privateFile = captureFailure("You're not allowed to see that!");
	assert.equal(privateRoute.response.statusCode, 404);
	assert.deepEqual(privateRoute.payload.error, { message: "Not found", code: "PRIVATE_ROUTE" });
	assert.equal(privateFile.response.statusCode, 404);
	assert.deepEqual(privateFile.payload.error, { message: "Not found", code: "NOT_FOUND" });
});

test("raw Error instances become generic 500 responses", () => {
	const failure = new Error("secret /Users/private/repository path");
	failure.code = "ENOENT";
	failure.stack = "stack at /mnt/private/server.js";
	const { response, payload } = captureFailure(failure);
	assert.equal(response.statusCode, 500);
	assert.deepEqual(payload.error, {
		message: "Internal server error",
		code: "INTERNAL_SERVER_ERROR"
	});
	assert.ok(!response.body.includes("private"));
});