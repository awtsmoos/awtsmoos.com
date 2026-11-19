// B"H — The Awtsmoos calls APIs through scopes, never borrowed identities.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Tool = require("./httpRequestTool.js");
const Transport = require("./httpTransport.js");
const Rate = require("./httpRateLimit.js");
const Catalog = require("./toolCatalog.js");
const Invocation = require("./toolInvocation.js");

const context = { request: { headers: { authorization: "Bearer MCP_SECRET" } } };
const identity = { accountId: "owner1", scopes: ["tunnel.read", "awtsmoos.api"] };

/** Confirm application identity cannot be borrowed by an external API. */
test("authorization gates public and external tool before transport", async () => {
	const original = Transport.send;
	let contacted = 0;
	Transport.send = async () => { contacted++; return { ok: true, statusCode: 200 }; };
	try {
		for (const scopes of [[], ["tunnel.read"]]) {
			const denied = await Tool.request(context, { accountId: "ownerX", scopes },
				{ mode: "external", url: "https://example.org" });
			assert.equal(denied.statusCode, 403);
		}
		assert.equal(contacted, 0);
	} finally { Transport.send = original; }
});

/** No public Awtsmoos route may receive a caller's session bearer. */
test("strict outbound validation rejects leaking and forged headers", async () => {
	const original = Transport.send;
	let contacted = 0;
	Transport.send = async () => { contacted++; return { ok: true, statusCode: 200 }; };
	try {
		for (const headers of [
			{ Cookie: "secret" }, { Host: "evil.example" },
			{ Authorization: "Bearer MCP_SECRET" }, { "X-Forwarded-Host": "localhost" },
			{ "X-Api-Key": "public-mode-forbidden" }
		]) {
			const result = await Tool.request(context, identity,
				{ mode: "awtsmoos-public", url: "/api/test", headers });
			assert.equal(result.statusCode, 400, JSON.stringify(headers));
		}
		const copied = await Tool.request(context, identity, { mode: "external",
			url: "https://example.org/", headers: { authorization: "Bearer MCP_SECRET" } });
		assert.equal(copied.statusCode, 400);
		assert.equal(contacted, 0);
	} finally { Transport.send = original; }
});

test("permitted public and external requests never implicitly forward MCP bearer", async () => {
	const original = Transport.send;
	Rate.resetForTests();
	const captured = [];
	Transport.send = async options => {
		captured.push(options);
		return { ok: true, statusCode: 200, body: { result: "ok" } };
	};
	try {
		const publicResult = await Tool.request(context, identity,
			{ mode: "awtsmoos-public", url: "/api/test", query: { a: "one" } });
		assert.equal(publicResult.ok, true);
		assert.equal(captured[0].url.href, "https://awtsmoos.com/api/test?a=one");
		assert.equal(captured[0].headers.authorization, undefined);
		assert.equal(captured[0].headers.cookie, undefined);
		const external = await Tool.request(context, identity,
			{ mode: "external", url: "https://example.org/", method: "POST",
				body: { hello: "world" }, headers: { "x-api-key": "explicit-target-only" } });
		assert.equal(external.ok, true);
		assert.equal(captured[1].headers["x-api-key"], "explicit-target-only");
		assert.equal(captured[1].body, '{"hello":"world"}');
		assert.equal(captured[1].headers.authorization, undefined);
	} finally { Transport.send = original; }
});

test("misformed body, private URL and excessive input fail safely", async () => {
	for (const args of [
		{ url: "http://example.org" },
		{ url: "https://127.0.0.1" },
		{ url: "https://example.org", method: "GET", body: "foo" },
		{ url: "https://example.org", method: "POST", body: "a".repeat(66000) },
		{ url: "https://example.org", query: { a: { x: 1 } } }
	]) {
		const result = await Tool.request(context, identity, args);
		assert.equal(result.statusCode, 400);
	}
});

test("MCP tool is discoverable, bound and returns structured failure", async () => {
	assert.ok(Catalog.tools.some(item => item.name === "awtsmoos_https_request"));
	assert.equal(typeof Invocation.handlerFor("awtsmoos_https_request"), "function");
	const response = await Invocation.call(context, { accountId: "denied", scopes: [] }, {
		name: "awtsmoos_https_request", arguments: { url: "https://example.org" }
	});
	assert.equal(response.isError, true);
	assert.equal(response.structuredContent.error, "awtsmoos_api_scope_required");
});
