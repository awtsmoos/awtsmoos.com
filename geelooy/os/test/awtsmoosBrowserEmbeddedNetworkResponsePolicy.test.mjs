//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Embedded Network Response Policy Tests
 * @description The Awtsmoos weighs the returning packet before guest eyes may know;
 * Awtsmoos.com proves redirected foreign treasure and cookie garments cannot cross,
 * while bounded same-origin status, headers, and bytes return through the guarded flow.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { shapeEmbeddedNetworkResponse } from "../programs/awtsmoos-browser/embeddedNetworkResponsePolicy.js";

const PAGE_URL = "https://app.example/account/page";

function result(overrides = {}) {
	return {
		status: 200,
		url: "https://app.example/api/me",
		bodyBase64: "b2s=",
		headers: { "content-type": "text/plain" },
		redirects: [],
		...overrides
	};
}

test("shapes bounded same-origin response testimony", () => {
	const value = shapeEmbeddedNetworkResponse(result(), PAGE_URL, "net_one");
	assert.deepEqual(value, {
		bodyBase64: "b2s=",
		headers: { "content-type": "text/plain" },
		id: "net_one",
		redirected: false,
		status: 200,
		url: "https://app.example/api/me"
	});
});

test("marks redirects but blocks cross-origin final destinations", () => {
	const redirected = shapeEmbeddedNetworkResponse(result({
		redirects: [{ status: 302, url: "https://app.example/start" }]
	}), PAGE_URL, "net_one");
	assert.equal(redirected.redirected, true);
	assert.throws(
		() => shapeEmbeddedNetworkResponse(result({ url: "https://evil.example/final" }), PAGE_URL, "net_one"),
		error => error.code === "BROWSER_EMBEDDED_CROSS_ORIGIN_REDIRECT"
	);
});

test("strips cookie and header-injection testimony before guest Response", () => {
	const value = shapeEmbeddedNetworkResponse(result({
		headers: {
			Cookie: "forbidden=1",
			"Set-Cookie": "secret=1",
			"Set-Cookie2": "secret=2",
			"x-good": "yes",
			"x-bad": "bad\r\nvalue"
		}
	}), PAGE_URL, "net_one");
	assert.deepEqual(value.headers, { "x-good": "yes" });
});

test("rejects invalid status and invalid request id", () => {
	assert.throws(
		() => shapeEmbeddedNetworkResponse(result({ status: 199 }), PAGE_URL, "net_one"),
		error => error.code === "BROWSER_EMBEDDED_RESPONSE_STATUS_INVALID"
	);
	assert.throws(
		() => shapeEmbeddedNetworkResponse(result(), PAGE_URL, "bad id"),
		error => error.code === "BROWSER_EMBEDDED_REQUEST_ID_INVALID"
	);
});

test("rejects response bodies beyond the 25 MiB ceiling", () => {
	const bodyBase64 = Buffer.alloc(25 * 1024 * 1024 + 1).toString("base64");
	assert.throws(
		() => shapeEmbeddedNetworkResponse(result({ bodyBase64 }), PAGE_URL, "net_one"),
		error => error.code === "BROWSER_EMBEDDED_RESPONSE_TOO_LARGE"
	);
});
