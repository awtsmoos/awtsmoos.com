//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared browser Tunnel HTTP gateway tests.
 * @description
 * The Awtsmoos renews HTTP beneath every Geelooy assistant while Awtsmoos.com proves status truth, JSON parsing, cancellation, and headers once;
 * callers may keep backend fields top-level without losing the transport testimony needed for calm retry, diagnosis, and mobile cancellation.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { tunnelJsonRequest } from "../tunnelHttp.js";

test("successful JSON preserves backend fields and transport metadata", async () => {
	const result = await tunnelJsonRequest("/test", {
		requestId: "request-one",
		fetchImpl: async () => response({ value: 7 }, 200)
	});
	assert.equal(result.ok, true);
	assert.equal(result.value, 7);
	assert.equal(result.httpStatus, 200);
	assert.equal(result.requestId, "request-one");
});

test("HTTP failure can never masquerade as success", async () => {
	const result = await tunnelJsonRequest("/test", {
		fetchImpl: async () => response({ ok: true, message: "wrong" }, 500)
	});
	assert.equal(result.ok, false);
	assert.equal(result.httpOk, false);
	assert.equal(result.httpStatus, 500);
});

test("invalid JSON becomes a structured transport failure", async () => {
	const result = await tunnelJsonRequest("/test", {
		fetchImpl: async () => ({ ok: true, status: 200, text: async () => "not-json" })
	});
	assert.equal(result.ok, false);
	assert.equal(result.error, "invalid_json_response");
});

test("external cancellation is distinguished from timeout", async () => {
	const controller = new AbortController();
	const pending = tunnelJsonRequest("/test", {
		signal: controller.signal,
		fetchImpl: async (_url, options) => new Promise((_resolve, reject) => {
			options.signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
		})
	});
	controller.abort("newer tap");
	const result = await pending;
	assert.equal(result.ok, false);
	assert.equal(result.aborted, true);
	assert.equal(result.timeout, false);
	assert.equal(result.error, "request_aborted");
});

function response(body, status) {
	return {
		ok: status >= 200 && status < 300,
		status,
		text: async () => JSON.stringify(body)
	};
}
