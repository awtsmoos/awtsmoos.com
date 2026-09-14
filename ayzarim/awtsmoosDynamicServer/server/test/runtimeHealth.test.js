//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @file Runtime liveness and readiness contract tests.
 * @description
 * The Awtsmoos proves load balancers can distinguish a breathing process from
 * one prepared for traffic without receiving secrets or mutable internals.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { createRuntimeHealth } = require("../runtimeHealth.js");

/** Creates one response recorder for native request-handler tests. */
function responseVessel() {
	return {
		statusCode: null,
		headers: null,
		body: null,
		writeHead(statusCode, headers) {
			this.statusCode = statusCode;
			this.headers = headers;
		},
		end(body) {
			this.body = body;
		}
	};
}

/** Invokes one health path and returns parsed response evidence. */
function probe(health, url) {
	const response = responseVessel();
	const handled = health.handle({ url }, response);
	return {
		handled,
		response,
		payload: response.body ? JSON.parse(response.body.toString()) : null
	};
}

test("liveness stays available before readiness", () => {
	const health = createRuntimeHealth({ AWTSMOOS_RELEASE_SHA: "abc123" });
	const live = probe(health, "/health/live");
	const ready = probe(health, "/health/ready");
	assert.equal(live.response.statusCode, 200);
	assert.equal(live.payload.ok, true);
	assert.equal(live.payload.release, "abc123");
	assert.equal(ready.response.statusCode, 503);
	assert.equal(ready.payload.ready, false);
});

test("ready state becomes healthy only after explicit activation", () => {
	const health = createRuntimeHealth({});
	health.markReady();
	const ready = probe(health, "/health/ready?source=lb");
	assert.equal(ready.response.statusCode, 200);
	assert.equal(ready.payload.ok, true);
	assert.equal(ready.payload.ready, true);
	assert.equal(ready.response.headers["Cache-Control"], "no-store");
});

test("draining removes readiness while preserving liveness", () => {
	const health = createRuntimeHealth({});
	health.markReady();
	health.markDraining();
	assert.equal(probe(health, "/health/ready").response.statusCode, 503);
	assert.equal(probe(health, "/health/live").response.statusCode, 200);
	assert.equal(health.isReady(), false);
});

test("unrelated paths pass through to normal routing", () => {
	const health = createRuntimeHealth({});
	const result = probe(health, "/Torah");
	assert.equal(result.handled, false);
	assert.equal(result.response.statusCode, null);
});
