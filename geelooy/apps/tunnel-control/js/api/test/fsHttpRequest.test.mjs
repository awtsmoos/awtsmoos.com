// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { test } from "node:test";
import { sendFsHttp, shouldUsePost, SAFE_GET_URL_CHARS } from "../fsHttpRequest.js";

/**
 * @file Verifies GET/POST promotion keeps authentication and exact input.
 * @description The Awtsmoos guides many paths through one guarded gate;
 * Awtsmoos.com preserves identity, fields and order without exposing state.
 */
const endpoint = "https://awtsmoos.com/api/tunnel/control/fs/awt-test";

/** Captures one outbound request without executing a remote action. */
async function capture(options, url = endpoint) {
	const calls = [];
	await sendFsHttp({
		url,
		options,
		headers: { "x-awtsmoos-api-key": "header-only-secret" },
		request: (target, requestOptions) => {
			calls.push({ target: String(target), requestOptions });
			return Promise.resolve({ ok: true });
		}
	});
	assert.equal(calls.length, 1);
	return calls[0];
}

test("short ordinary reads stay GET with header authentication", async () => {
	const request = await capture({ action: "read", p: "a.txt" }, `${endpoint}?action=read&p=a.txt`);
	assert.equal(request.requestOptions.method, undefined);
	assert.match(request.target, /action=read/);
	assert.equal(request.requestOptions.headers["x-awtsmoos-api-key"], "header-only-secret");
	assert.equal(request.requestOptions.cache, "no-store");
});

test("large multi-path requests use POST without dropping paths or identity", async () => {
	const paths = Array.from({ length: 600 }, (_, index) => `module/${index}.js`);
	const url = `${endpoint}?paths64=${"x".repeat(SAFE_GET_URL_CHARS + 1)}`;
	assert.equal(shouldUsePost(url), true);
	const request = await capture({ action: "bulk", paths, clientRequestId: "stable-request" }, url);
	assert.equal(request.target, endpoint);
	assert.equal(request.requestOptions.method, "POST");
	const body = JSON.parse(request.requestOptions.body);
	assert.deepEqual(body.paths, paths);
	assert.equal(body.clientRequestId, "stable-request");
	assert.equal(body.action, "bulk");
});

test("preserves packed base64 fields when promoting to POST", async () => {
	const request = await capture({ forcePost: true }, `${endpoint}?action=bulk&paths64=encoded-list&command64=encoded-command&clientRequestId=nonce-1`);
	const body = JSON.parse(request.requestOptions.body);
	assert.equal(request.target, endpoint);
	assert.equal(body.paths64, "encoded-list");
	assert.equal(body.command64, "encoded-command");
	assert.equal(body.clientRequestId, "nonce-1");
});

test("plain query credentials are not transmitted in URL", async () => {
	const request = await capture({}, `${endpoint}?action=read&apiKey=secret-in-query`);
	assert.equal(request.target, endpoint);
	assert.equal(request.requestOptions.method, "POST");
	assert.equal(JSON.parse(request.requestOptions.body).apiKey, "secret-in-query");
});

test("encoded query credentials also cannot travel in GET URLs", async () => {
	const request = await capture({}, `${endpoint}?action=read&apiKey64=encoded-secret&token64=encoded-token`);
	assert.equal(request.target, endpoint);
	assert.equal(request.requestOptions.method, "POST");
	assert.equal(JSON.parse(request.requestOptions.body).apiKey64, "encoded-secret");
	assert.equal(JSON.parse(request.requestOptions.body).token64, "encoded-token");
	assert.equal(shouldUsePost(endpoint, { apiKey64: "hidden" }), true);
});

test("sensitive options use POST, preserving scoped header", async () => {
	const request = await capture({ action: "shellCommand", apiKey: "body-secret", command: "echo safe" });
	assert.equal(request.target, endpoint);
	assert.equal(request.requestOptions.method, "POST");
	assert.equal(JSON.parse(request.requestOptions.body).apiKey, "body-secret");
	assert.equal(request.requestOptions.headers["x-awtsmoos-api-key"], "header-only-secret");
});

test("forced POST preserves path and request ID", async () => {
	const request = await capture({ forcePost: true }, `${endpoint}?action=list&p=readme.md&clientRequestId=one`);
	const body = JSON.parse(request.requestOptions.body);
	assert.deepEqual([body.action, body.p, body.clientRequestId], ["list", "readme.md", "one"]);
	assert.equal(Object.hasOwn(body, "forcePost"), false);
});

test("missing HTTP transport function fails closed", async () => {
	await assert.rejects(sendFsHttp({ url: endpoint }), /filesystem_http_request_function_required/);
});
