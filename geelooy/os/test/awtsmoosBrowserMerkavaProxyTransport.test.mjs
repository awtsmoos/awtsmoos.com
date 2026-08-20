//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves guest network intent crosses only the host-owned Drive bridge.
 * Awtsmoos.com keeps page origin, alias, project, and jar authority outside guest code
 * while textual and binary request garments remain deterministic in tests.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	createMerkavaProxyTransport
} from "../programs/awtsmoos-browser/merkavaProxyTransport.js";

test("Merkava proxy transport resolves guest URLs with host-owned context", async () => {
	const calls = [];
	const transport = createMerkavaProxyTransport({
		aliasId: "asdf",
		fetchImpl: recorder(calls),
		jarId: "login",
		pageUrl: "https://example.com/app/index.html",
		projectId: "site-1"
	});
	const result = await transport({
		body: new URLSearchParams({ name: "awtsmoos" }),
		headers: new Headers({
			Cookie: "guest=forbidden",
			"X-Guest": "one"
		}),
		method: "POST",
		url: "../login"
	});
	assert.equal(result.text, "ok");
	const payload = JSON.parse(calls[0].options.body);
	assert.equal(calls[0].url, "/api/social/drive/asdf/browser/fetch");
	assert.equal(payload.url, "https://example.com/login");
	assert.equal(payload.initiatorUrl, "https://example.com/app/index.html");
	assert.equal(payload.jarId, "login");
	assert.equal(payload.projectId, "site-1");
	assert.equal(payload.body, "name=awtsmoos");
	assert.equal(payload.headers.cookie, undefined);
	assert.equal(payload.headers["x-guest"], "one");
});

test("Merkava proxy transport routes binary bodies as base64", async () => {
	const calls = [];
	const transport = createMerkavaProxyTransport({
		aliasId: "asdf",
		fetchImpl: recorder(calls),
		pageUrl: "https://example.com/"
	});
	await transport({
		body: Uint8Array.from([0, 1, 2]),
		method: "POST",
		url: "/upload"
	});
	const payload = JSON.parse(calls[0].options.body);
	assert.equal(payload.body, undefined);
	assert.equal(payload.bodyBase64, "AAEC");
});

test("Merkava proxy transport requires a valid virtual page URL", () => {
	assert.throws(
		() => createMerkavaProxyTransport({ aliasId: "asdf" }),
		error => error.code === "BROWSER_PAGE_URL_REQUIRED"
	);
});

function recorder(calls) {
	return async (url, options) => {
		calls.push({ url, options });
		return {
			ok: true,
			status: 200,
			headers: { get: () => null },
			async json() {
				return { status: 200, text: "ok" };
			}
		};
	};
}
