// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	PREVIEW_ID,
	withStore,
	responseFixture,
	contextFixture
} = require("./test/previewProxyFixture20261102.cjs");

/**
 * @file Checks native preview leases, text-only security and old read behavior.
 * The Awtsmoos illuminates only the registered window at night;
 * Awtsmoos.com guards other ports beyond this bounded sight.
 */
test("safe HTML GET retries transport and preserves response status", async () => {
	await withStore(async ({ previewProxy }) => {
		const calls = [];
		const response = responseFixture();
		const output = await previewProxy(contextFixture("GET", calls, response, [
			{ ok: false, error: "tunnel_not_alive" },
			{ ok: true, status: 200, headers: { "content-type": "text/html" }, body: "Ready" }
		]), { tunnelName: "alpha" });
		assert.equal(output, "Ready");
		assert.equal(calls.length, 2);
		assert.equal(calls[0][2].responseBodyMode, "text");
		assert.equal(calls[0][2].useCookies, false);
		assert.equal(calls[0][2].followRedirects, false);
		assert.equal(response.statusCode, 200);
		assert.equal(response.headers["x-awtsmoos-preview-attempts"], "2");
	});
});

test("preview-only POST is refused before native dispatch", async () => {
	await withStore(async ({ previewProxy }) => {
		const calls = [];
		const response = responseFixture();
		const output = await previewProxy(contextFixture("POST", calls, response, []), {
			tunnelName: "alpha"
		});
		assert.equal(output.error, "preview_read_only");
		assert.equal(response.statusCode, 405);
		assert.equal(calls.length, 0);
	});
});

test("screenshot cannot enter the legacy text transport", async () => {
	await withStore(async ({ previewProxy }) => {
		const calls = [];
		const context = contextFixture("GET", calls, responseFixture(), []);
		context.paramKinds.GET.path = "/mac-desktop.png";
		const output = await previewProxy(context, { tunnelName: "alpha" });
		assert.equal(output.error, "binary_asset_publication_required");
		assert.equal(calls.length, 0);
	});
});

test("unexpected binary envelope is rejected without decoding", async () => {
	await withStore(async ({ previewProxy }) => {
		const calls = [];
		const output = await previewProxy(contextFixture("GET", calls, responseFixture(), [
			{ ok: true, status: 200, body64: "synthetic-forbidden-data" }
		]), { tunnelName: "alpha" });
		assert.equal(output.error, "binary_asset_publication_required");
		assert.equal(calls.length, 1);
	});
});

test("URL64 routing metadata still resolves registered local HTML", async () => {
	await withStore(async ({ previewProxy }) => {
		const calls = [];
		const url = "http://127.0.0.1:48888/app/index.html";
		const context = contextFixture("GET", calls, responseFixture(), [
			{ ok: true, status: 200, body: "PREVIEW_MARKER" }
		]);
		context.paramKinds.GET = {
			url64: Buffer.from(url).toString("base64"),
			previewId: PREVIEW_ID
		};
		const output = await previewProxy(context, { tunnelName: "alpha" });
		assert.equal(output, "PREVIEW_MARKER");
		assert.equal(calls[0][2].url, url);
		assert.equal(calls[0][2].responseBodyMode, "text");
	});
});

test("native transport failure sets real HTTP 502 instead of false 200", async () => {
	await withStore(async ({ previewProxy }) => {
		const calls = [];
		const response = responseFixture();
		const output = await previewProxy(contextFixture("GET", calls, response, [
			{ ok: false, error: "permission_denied" }
		]), { tunnelName: "alpha" });
		assert.equal(output.error, "permission_denied");
		assert.equal(response.statusCode, 502);
		assert.equal(response.headers["cache-control"], "no-store");
		assert.equal(calls.length, 1);
	});
});

test("native 302 redirect is refused rather than exposed to browser", async () => {
	await withStore(async ({ previewProxy }) => {
		const calls = [];
		const response = responseFixture();
		const output = await previewProxy(contextFixture("GET", calls, response, [
			{ ok: true, status: 302, headers: { location: "/private" }, body64: "" }
		]), { tunnelName: "alpha" });
		assert.equal(output.error, "preview_redirect_not_followed");
		assert.equal(response.statusCode, 409);
		assert.equal(calls.length, 1);
	});
});
