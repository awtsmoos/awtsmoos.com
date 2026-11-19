// B"H — The Awtsmoos guards DNS, TLS, redirects and response boundaries.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const EventEmitter = require("node:events");
const https = require("node:https");
const { requestViaAddress } = require("./httpTransport.js");

/** Simulate the network without opening any outgoing real sockets. */
function fakeHttps(statusCode, headers, content, inspect) {
	const original = https.request;
	https.request = (options, respond) => {
		inspect(options);
		const request = new EventEmitter();
		request.setTimeout = () => {};
		request.write = () => {};
		request.end = () => {
			const response = new EventEmitter();
			response.statusCode = statusCode;
			response.headers = headers;
			respond(response);
			process.nextTick(() => {
				response.emit("data", Buffer.from(content));
				response.emit("end");
			});
		};
		request.destroy = error => request.emit("error", error);
		return request;
	};
	return () => { https.request = original; };
}

const exchange = (method = "GET") => ({
	url: new URL("https://example.org/api/sample"),
	method, headers: {}, body: null
});

test("Node 20 all:true lookup and legacy callback both pin the same public IP", async () => {
	let validated = false;
	const restore = fakeHttps(200, { "content-type": "application/json" }, '{"ok":true}', options => {
		assert.equal(options.hostname, "example.org");
		assert.equal(options.servername, "example.org");
		assert.equal(options.rejectUnauthorized, true);
		assert.equal(options.port, 443);
		assert.equal(options.agent, false);
		assert.equal(options.path, "/api/sample");
		options.lookup("example.org", { all: true }, (error, records) => {
			assert.equal(error, null);
			assert.deepEqual(records, [{ address: "8.8.8.8", family: 4 }]);
		});
		options.lookup("example.org", {}, (error, address, family) => {
			assert.equal(error, null);
			assert.equal(address, "8.8.8.8");
			assert.equal(family, 4);
			validated = true;
		});
	});
	try {
		const outcome = await requestViaAddress(exchange(), "8.8.8.8");
		assert.equal(outcome.ok, true);
		assert.deepEqual(outcome.body, { ok: true });
		assert.equal(validated, true);
	} finally { restore(); }
});

test("redirect is returned but never followed, without leaking Location", async () => {
	let calls = 0;
	const restore = fakeHttps(302, {
		location: "http://127.0.0.1/", "content-type": "text/plain"
	}, "Redirect", () => { calls++; });
	try {
		const result = await requestViaAddress(exchange(), "8.8.8.8");
		assert.equal(result.redirectBlocked, true);
		assert.equal(result.ok, false);
		assert.equal(result.headers.location, undefined);
		assert.equal(calls, 1);
	} finally { restore(); }
});

test("oversized response fails rather than truncating", async () => {
	const restore = fakeHttps(200, { "content-type": "text/plain" },
		"x".repeat(256 * 1024 + 1), () => {});
	try {
		await assert.rejects(requestViaAddress(exchange(), "8.8.8.8"), /response_too_large/);
	} finally { restore(); }
});

test("binary and unexpected compressed replies cannot be decoded", async () => {
	for (const headers of [
		{ "content-encoding": "gzip", "content-type": "application/json" },
		{ "content-type": "application/octet-stream" }
	]) {
		const restore = fakeHttps(200, headers, '{"ok":true}', () => {});
		try { await assert.rejects(requestViaAddress(exchange(), "8.8.8.8")); }
		finally { restore(); }
	}
});

test("HEAD and 204 may have empty bodies without parsing JSON", async () => {
	for (const [method, status] of [["HEAD", 200], ["GET", 204]]) {
		const restore = fakeHttps(status, { "content-type": "application/json" }, "", () => {});
		try {
			const result = await requestViaAddress(exchange(method), "8.8.8.8");
			assert.equal(result.ok, true);
			assert.equal(result.body, null);
		} finally { restore(); }
	}
});
