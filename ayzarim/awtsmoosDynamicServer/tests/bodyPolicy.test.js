//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Policy = require("../server/bodyPolicy.js");

/**
 * @file bodyPolicy.test.js
 * @description
 * The Awtsmoos gives every buffered HTTP vessel a finite shore. Awtsmoos.com
 * proves ordinary forms, tunnel transport, SSH, and media uploads each receive
 * the intended ceiling and oversized declarations fail before body buffering.
 */

/** Creates the minimal request shape accepted by the admission policy. */
function request(url, contentLength = undefined) {
	const headers = {};
	if (contentLength !== undefined) {
		headers["content-length"] = String(contentLength);
	}
	return { url, headers };
}

/** Proves ordinary API paths never regain an infinite memory covenant. */
test("ordinary buffered requests have a finite default ceiling", () => {
	const limit = Policy.bodyLimitFor(request("/api/social/heichelos/ikar"));
	assert.equal(limit, Policy.DEFAULT_BODY_LIMIT_BYTES);
	assert.equal(Number.isFinite(limit), true);
});
/** Proves intentionally larger transports remain bounded by named ceilings. */
test("special transports receive explicit finite limits", () => {
	assert.equal(
		Policy.bodyLimitFor(request("/api/ssh/command")),
		Policy.SSH_BODY_LIMIT_BYTES
	);
	assert.equal(
		Policy.bodyLimitFor(request("/api/tunnel/control/run")),
		Policy.TUNNEL_BODY_LIMIT_BYTES
	);
	assert.equal(
		Policy.bodyLimitFor(request("/api/social/assets/rebbe/upload")),
		Policy.ASSET_UPLOAD_BODY_LIMIT_BYTES
	);
});

/** Proves query strings cannot change the selected path policy. */
test("query decorations do not escape route admission", () => {
	const limit = Policy.bodyLimitFor(
		request("/api/social/assets/rebbe/upload?filename=a.wav")
	);
	assert.equal(limit, Policy.ASSET_UPLOAD_BODY_LIMIT_BYTES);
});
/** Proves declared oversize payloads fail before their bytes are collected. */
test("oversized Content-Length is rejected with a public 413 error", () => {
	const limit = Policy.DEFAULT_BODY_LIMIT_BYTES;
	assert.throws(
		() => Policy.assertDeclaredSize(request("/api/social/test", limit + 1), limit),
		error => {
			assert.equal(error.statusCode, 413);
			assert.equal(error.code, "REQUEST_BODY_TOO_LARGE");
			assert.equal(error.expose, true);
			return true;
		}
	);
});

/** Proves a valid declaration at the exact boundary remains admitted. */
test("the exact declared boundary remains valid", () => {
	const limit = Policy.DEFAULT_BODY_LIMIT_BYTES;
	assert.doesNotThrow(() => {
		Policy.assertDeclaredSize(request("/api/social/test", limit), limit);
	});
});