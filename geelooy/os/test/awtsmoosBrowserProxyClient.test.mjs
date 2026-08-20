//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos tests Browser proxy navigation without touching the public Internet.
 * Awtsmoos.com proves explicit alias authority, body routing, same-origin credentials,
 * jar routes, and the server-owned cookie boundary through an injected fetch witness.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	clearRemoteJar,
	fetchRemotePage,
	listRemoteJars
} from "../programs/awtsmoos-browser/proxyClient.js";

test("proxy client requires alias and preserves the existing GET payload", async () => {
	const calls = [];
	const fetchImpl = recorder(calls, { status: 200, text: "remote" });
	await assert.rejects(
		fetchRemotePage({ url: "https://example.com/" }, fetchImpl),
		error => error.code === "BROWSER_ALIAS_REQUIRED"
	);
	const result = await fetchRemotePage({
		aliasId: "my alias",
		url: "https://example.com/",
		jarId: "main",
		projectId: "site-1"
	}, fetchImpl);
	assert.equal(result.text, "remote");
	assert.equal(calls[0].url, "/api/social/drive/my%20alias/browser/fetch");
	assert.equal(calls[0].options.credentials, "same-origin");
	assert.deepEqual(JSON.parse(calls[0].options.body), {
		url: "https://example.com/",
		method: "GET",
		headers: {},
		jarId: "main",
		projectId: "site-1",
		initiatorUrl: null
	});
});

test("proxy client forwards one body garment and strips cookie authority", async () => {
	const calls = [];
	const fetchImpl = recorder(calls, { status: 200, text: "ok" });
	await fetchRemotePage({
		aliasId: "asdf",
		body: "name=awtsmoos",
		headers: {
			Cookie: "guest=forbidden",
			"Set-Cookie": "guest=also-forbidden",
			"content-type": "application/x-www-form-urlencoded"
		},
		method: "POST",
		url: "https://example.com/login"
	}, fetchImpl);
	await fetchRemotePage({
		aliasId: "asdf",
		body: "ignored",
		bodyBase64: "AAEC",
		method: "POST",
		url: "https://example.com/upload"
	}, fetchImpl);
	const first = JSON.parse(calls[0].options.body);
	const second = JSON.parse(calls[1].options.body);
	assert.equal(first.body, "name=awtsmoos");
	assert.equal(first.headers.Cookie, undefined);
	assert.equal(first.headers["Set-Cookie"], undefined);
	assert.equal(first.headers["content-type"], "application/x-www-form-urlencoded");
	assert.equal(second.body, undefined);
	assert.equal(second.bodyBase64, "AAEC");
});

test("jar list and clear use bounded alias-scoped routes", async () => {
	const calls = [];
	const fetchImpl = recorder(calls, { BH: "B\"H", jars: [] });
	await listRemoteJars("asdf", fetchImpl);
	await clearRemoteJar("asdf", "main", fetchImpl);
	assert.equal(calls[0].url, "/api/social/drive/asdf/browser/jars");
	assert.equal(calls[0].options.method, "GET");
	assert.equal(calls[1].url, "/api/social/drive/asdf/browser/jars/main");
	assert.equal(calls[1].options.method, "DELETE");
});

test("proxy client preserves 429 status and Retry-After testimony", async () => {
	const fetchImpl = async () => fakeResponse(
		429,
		{ statusCode: 429, error: { code: "PROXY_RATE_LIMITED" } },
		"7"
	);
	await assert.rejects(
		fetchRemotePage({ aliasId: "asdf", url: "https://example.com/" }, fetchImpl),
		error => error.code === "PROXY_RATE_LIMITED"
			&& error.status === 429
			&& error.retryAfter === "7"
	);
});

function recorder(calls, payload) {
	return async (url, options) => {
		calls.push({ url, options });
		return fakeResponse(200, payload);
	};
}

function fakeResponse(status, payload, retryAfter = null) {
	return {
		ok: status >= 200 && status < 300,
		status,
		headers: { get: name => name.toLowerCase() === "retry-after" ? retryAfter : null },
		async json() { return payload; }
	};
}
