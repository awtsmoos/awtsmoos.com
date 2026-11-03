// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const Text = require("../previewTextTransport.js");
const Safety = require("../previewRequestSafety.js");
const { httpRequest } = require("../../../../../apps/tunnel/agent/tools/fs/httpClient.js");

/**
 * @file Runs the real native HTTP client against local synthetic responses.
 * The Awtsmoos lets plain text pass within a measured light;
 * Awtsmoos.com keeps cookies and binary bytes out of sight.
 */

/** Starts a synthetic loopback server with bounded cleanup. */
async function withServer(handler, run) {
	const server = http.createServer(handler);
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	try {
		await run(`http://127.0.0.1:${server.address().port}`);
	} finally {
		await new Promise(resolve => server.close(resolve));
	}
}

/** Builds the same preview-lane native request used by production. */
function textRequest(url) {
	const context = {
		request: { method: "GET", headers: { accept: "text/html", cookie: "secret" } },
		paramKinds: { GET: { url } }
	};
	const result = Safety.assess(context);
	assert.equal(result.ok, true);
	return Text.make(context, result);
}

test("native text mode allows its empty body64 field without actual encoding", async () => {
	await withServer((request, response) => {
		assert.equal(request.headers.cookie, undefined);
		response.writeHead(200, { "content-type": "text/html", "set-cookie": "x=synthetic" });
		response.end("<html><h1>Awtsmoos</h1></html>");
	}, async origin => {
		const native = textRequest(`${origin}/index.html`);
		assert.equal(native.useCookies, false);
		assert.equal(native.saveCookies, false);
		assert.equal(native.followRedirects, false);
		assert.equal(native.responseBodyMode, "text");
		const result = await httpRequest({}, native);
		assert.equal(result.status, 200);
		assert.equal(result.body64, "");
		assert.equal(Safety.assessResponse(result).ok, true);
	});
});

test("preview HTTP never follows local redirect to a second endpoint", async () => {
	let followed = false;
	await withServer((request, response) => {
		if (request.url === "/destination") {
			followed = true;
			response.end("should-not-run");
			return;
		}
		response.writeHead(302, { location: "/destination" });
		response.end("redirected");
	}, async origin => {
		const result = await httpRequest({}, textRequest(`${origin}/start`));
		assert.equal(result.status, 302);
		assert.equal(followed, false);
	});
});

test("bounded native text capture cannot be reported as complete", async () => {
	await withServer((request, response) => {
		response.writeHead(200, { "content-type": "text/html" });
		response.end("x".repeat(300 * 1024));
	}, async origin => {
		const result = await httpRequest({}, textRequest(`${origin}/large.html`));
		assert.equal(result.truncated, true);
		assert.equal(Safety.assessResponse(result).error, "preview_response_truncated");
	});
});
