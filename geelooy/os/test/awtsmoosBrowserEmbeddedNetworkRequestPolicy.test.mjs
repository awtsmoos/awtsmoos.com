//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Embedded Network Request Policy Tests
 * @description The Awtsmoos measures each guest request before the proxy sea may flow;
 * Awtsmoos.com proves same-origin roads, bounded bodies, and ordinary headers may pass,
 * while foreign origins and browser-owned garments find the measured gate closed below.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { validateEmbeddedNetworkRequest } from "../programs/awtsmoos-browser/embeddedNetworkRequestPolicy.js";

const PAGE_URL = "https://app.example/account/page";

function request(overrides = {}) {
	return {
		id: "net_one",
		url: "/api/me",
		method: "GET",
		headers: { accept: "application/json" },
		credentials: "same-origin",
		mode: "cors",
		redirect: "follow",
		bodyBase64: "",
		...overrides
	};
}

test("accepts relative same-origin requests and normalizes URL and method", () => {
	const value = validateEmbeddedNetworkRequest(request(), PAGE_URL);
	assert.equal(value.url, "https://app.example/api/me");
	assert.equal(value.method, "GET");
	assert.equal(value.body.byteLength, 0);
	assert.deepEqual(value.headers, { accept: "application/json" });
});

test("accepts bounded POST body and approved headers", () => {
	const value = validateEmbeddedNetworkRequest(request({
		method: "post",
		bodyBase64: "YWJjZA==",
		headers: { "content-type": "text/plain", authorization: "Bearer x" }
	}), PAGE_URL);
	assert.equal(new TextDecoder().decode(value.body), "abcd");
	assert.equal(value.method, "POST");
	assert.equal(value.headers.authorization, "Bearer x");
});

test("rejects cross-origin URLs and unsupported methods", () => {
	assert.throws(
		() => validateEmbeddedNetworkRequest(request({ url: "https://evil.example/a" }), PAGE_URL),
		error => error.code === "BROWSER_EMBEDDED_CROSS_ORIGIN_REQUEST"
	);
	assert.throws(
		() => validateEmbeddedNetworkRequest(request({ method: "PUT" }), PAGE_URL),
		error => error.code === "BROWSER_EMBEDDED_METHOD_FORBIDDEN"
	);
});

test("rejects GET bodies, oversized bodies, and malformed base64", () => {
	assert.throws(
		() => validateEmbeddedNetworkRequest(request({ bodyBase64: "YQ==" }), PAGE_URL),
		error => error.code === "BROWSER_EMBEDDED_BODY_FORBIDDEN"
	);
	const oversized = Buffer.alloc(1024 * 1024 + 1).toString("base64");
	assert.throws(
		() => validateEmbeddedNetworkRequest(request({ method: "POST", bodyBase64: oversized }), PAGE_URL),
		error => error.code === "BROWSER_EMBEDDED_BODY_TOO_LARGE"
	);
	assert.throws(
		() => validateEmbeddedNetworkRequest(request({ method: "POST", bodyBase64: "abc" }), PAGE_URL),
		error => error.code === "BROWSER_EMBEDDED_BODY_INVALID"
	);
});

test("rejects browser-owned or transport headers", () => {
	for (const name of ["cookie", "host", "origin", "referer", "user-agent", "sec-fetch-site"]) {
		assert.throws(
			() => validateEmbeddedNetworkRequest(request({ headers: { [name]: "forbidden" } }), PAGE_URL),
			error => error.code === "BROWSER_EMBEDDED_HEADER_FORBIDDEN"
		);
	}
});

test("rejects unsupported credential, mode, redirect, and request id testimony", () => {
	assert.throws(
		() => validateEmbeddedNetworkRequest(request({ credentials: "omit" }), PAGE_URL),
		error => error.code === "BROWSER_EMBEDDED_CREDENTIALS_UNSUPPORTED"
	);
	assert.throws(
		() => validateEmbeddedNetworkRequest(request({ mode: "no-cors" }), PAGE_URL),
		error => error.code === "BROWSER_EMBEDDED_MODE_UNSUPPORTED"
	);
	assert.throws(
		() => validateEmbeddedNetworkRequest(request({ redirect: "manual" }), PAGE_URL),
		error => error.code === "BROWSER_EMBEDDED_REDIRECT_UNSUPPORTED"
	);
	assert.throws(
		() => validateEmbeddedNetworkRequest(request({ id: "bad id" }), PAGE_URL),
		error => error.code === "BROWSER_EMBEDDED_REQUEST_ID_INVALID"
	);
});
