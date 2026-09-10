//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @file Native HTTP transport policy tests.
 * @description
 * The Awtsmoos proves abandoned clients receive finite time and count boundaries
 * while Awtsmoos.com still permits deliberate environment tuning without libraries.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	DEFAULTS,
	applyHttpTransportPolicy
} = require("../httpTransportPolicy.js");

/** Creates the minimal mutable server vessel required by the policy. */
function serverVessel() {
	return {};
}

test("HTTP transport defaults are finite and production bounded", () => {
	const server = serverVessel();
	const policy = applyHttpTransportPolicy(server, {});
	assert.deepEqual(policy, DEFAULTS);
	assert.equal(server.headersTimeout, 15_000);
	assert.equal(server.requestTimeout, 120_000);
	assert.equal(server.keepAliveTimeout, 5_000);
	assert.equal(server.maxRequestsPerSocket, 1_000);
	assert.equal(server.maxHeadersCount, 100);
});
test("HTTP transport accepts only positive integer overrides", () => {
	const server = serverVessel();
	const policy = applyHttpTransportPolicy(server, {
		AWTSMOOS_HTTP_HEADERS_TIMEOUT_MS: "20000",
		AWTSMOOS_HTTP_REQUEST_TIMEOUT_MS: "180000",
		AWTSMOOS_HTTP_KEEPALIVE_TIMEOUT_MS: "7000",
		AWTSMOOS_HTTP_MAX_REQUESTS_PER_SOCKET: "250",
		AWTSMOOS_HTTP_MAX_HEADERS_COUNT: "64"
	});
	assert.equal(policy.headersTimeout, 20_000);
	assert.equal(policy.requestTimeout, 180_000);
	assert.equal(policy.keepAliveTimeout, 7_000);
	assert.equal(policy.maxRequestsPerSocket, 250);
	assert.equal(policy.maxHeadersCount, 64);
});

test("invalid HTTP transport overrides cannot disable bounds", () => {
	const server = serverVessel();
	const policy = applyHttpTransportPolicy(server, {
		AWTSMOOS_HTTP_HEADERS_TIMEOUT_MS: "0",
		AWTSMOOS_HTTP_REQUEST_TIMEOUT_MS: "Infinity",
		AWTSMOOS_HTTP_KEEPALIVE_TIMEOUT_MS: "-1",
		AWTSMOOS_HTTP_MAX_REQUESTS_PER_SOCKET: "nope",
		AWTSMOOS_HTTP_MAX_HEADERS_COUNT: "3.5"
	});
	assert.deepEqual(policy, DEFAULTS);
});
