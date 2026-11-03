// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const { httpRequest } = require("../../../../../apps/tunnel/agent/tools/fs/httpClient.js");
const { PREVIEW_ID, withStore, contextFixture, responseFixture } =
	require("./previewProxyFixture20261102.cjs");

/**
 * @file Joins authorized preview, native registry proof and actual HTTP client.
 * The Awtsmoos shines through the registered local source of light;
 * Awtsmoos.com rejects unapproved media and false status by night.
 * The lease fixture is synthetic; the local HTTP handler actually runs.
 */

/** Starts a temporary private HTTP fixture and cleans it up after the test. */
async function withServer(handler, run) {
	const server = http.createServer(handler);
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	try {
		await run(`http://127.0.0.1:${server.address().port}`);
	} finally {
		await new Promise(resolve => server.close(resolve));
	}
}

/** Routes the post-lease HTTP step through the real native client. */
async function throughGateway(pathname, origin, listener) {
	await withStore(async ({ previewProxy }) => {
		const calls = [];
		const response = responseFixture();
		const context = contextFixture("GET", calls, response, []);
		const target = `${origin}${pathname}`;
		context.paramKinds.GET = { url: target, previewId: PREVIEW_ID };
		context.ws.sendTunnelRequest = async (owner, route, payload) => {
			if (payload.action === "previewList") {
				return { ok: true, previews: [{
					id: PREVIEW_ID,
					sourceUrl: target,
					status: "running",
					expiresAt: Date.now() + 60000
				}] };
			}
			calls.push({ owner, route, payload });
			return httpRequest({}, payload);
		};
		const outcome = await previewProxy(context, { tunnelName: "alpha" });
		await listener({ outcome, response, calls });
	});
}

test("registered HTML survives gateway and native client without cookies", async () => {
	await withServer((request, response) => {
		assert.equal(request.headers.cookie, undefined);
		response.writeHead(200, { "content-type": "text/html" });
		response.end("<h1>Verified text</h1>");
	}, async origin => {
		await throughGateway("/index.html", origin, ({ outcome, calls, response }) => {
			assert.equal(outcome, "<h1>Verified text</h1>");
			assert.equal(response.statusCode, 200);
			assert.equal(calls[0].payload.responseBodyMode, "text");
			assert.equal(calls[0].payload.followRedirects, false);
		});
	});
});

test("image disguised as HTML is blocked after actual native response", async () => {
	await withServer((request, response) => {
		response.writeHead(200, { "content-type": "image/png" });
		response.end(Buffer.from([137, 80, 78, 71]));
	}, async origin => {
		await throughGateway("/index.html", origin, ({ outcome, calls, response }) => {
			assert.equal(outcome.error, "binary_asset_publication_required");
			assert.equal(response.statusCode, 415);
			assert.equal(calls.length, 1);
		});
	});
});

test("native truncation yields HTTP 502 instead of partial success", async () => {
	await withServer((request, response) => {
		response.writeHead(200, { "content-type": "text/html" });
		response.end("x".repeat(300 * 1024));
	}, async origin => {
		await throughGateway("/large.html", origin, ({ outcome, response }) => {
			assert.equal(outcome.error, "preview_response_truncated");
			assert.equal(response.statusCode, 502);
		});
	});
});
