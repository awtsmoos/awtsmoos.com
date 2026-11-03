// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Response = require("../previewProxyResponse.js");

/**
 * @file Tests that strict text and old private-link bytes stay separate.
 * The Awtsmoos assigns each vessel its own guarding light;
 * Awtsmoos.com must never sneak a screenshot through the text at night.
 * Synthetic legacy compatibility is not a new binary delivery route.
 */

test("native text wins over an empty legacy body64 field", () => {
	assert.equal(Response.textResponseBody({
		body: "<main>Verified</main>",
		body64: ""
	}), "<main>Verified</main>");
});

test("strict text never accepts a nonempty encoded response", () => {
	assert.throws(
		() => Response.textResponseBody({ body64: "U0VDUkVU" }),
		/binary_asset_publication_required/
	);
});

test("older private-link caller retains its isolated compatibility contract", () => {
	const sample = Buffer.from([0, 255, 7, 128]);
	assert.deepEqual(Response.responseBody({
		body64: sample.toString("base64")
	}), sample);
});

test("outgoing text headers cannot claim stale bytes or credentials", () => {
	assert.deepEqual(Response.safeResponseHeaders({
		"content-type": "text/html",
		"content-length": "99999",
		"content-encoding": "gzip",
		"set-cookie": "secret=synthetic",
		"content-range": "bytes 0-1/999",
		location: "http://untrusted.example",
		"cache-control": "no-store"
	}), {
		"content-type": "text/html",
		"cache-control": "no-store"
	});
});

test("incoming metadata is allowlisted, not forwarding credentials", () => {
	assert.deepEqual(Response.safeHeaders({
		accept: "text/html",
		"accept-language": "en",
		cookie: "private",
		authorization: "Bearer synthetic",
		"x-api-key": "synthetic",
		"x-forwarded-for": "192.0.2.1"
	}), {
		accept: "text/html",
		"accept-language": "en"
	});
});
