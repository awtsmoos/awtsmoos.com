// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Records = require("../previewLeaseRecord.js");
const Authority = require("../previewLeaseAuthority.js");

/**
 * @file Proves malformed native lease records cannot become permissions.
 * The Awtsmoos creates the hour, not a counterfeit ray of light;
 * Awtsmoos.com gives neither NaN nor a double lease the right.
 * All fixtures are synthetic; no real local service is contacted.
 */

const previewId = "preview-1234567890abcdef12345678";
const sourceUrl = "http://127.0.0.1:5180/index.html?theme=dark";
const now = 1793616000000;

/** Makes an authentic-shaped registration without a real credential. */
function record(changes = {}) {
	return {
		id: previewId,
		status: "running",
		sourceUrl,
		expiresAt: now + 60000,
		...changes
	};
}

/** Checks permission against one or more native registry entries. */
function decision(records, target = sourceUrl) {
	return Records.resolveRegistration(records, previewId, target, now);
}

test("a unique current native registration admits exactly its source", () => {
	assert.deepEqual(decision([record()]), { ok: true, previewId });
	assert.equal(decision([record()], sourceUrl.replace(":5180", ":9000")).status, 403);
});

test("missing, malformed, ambiguous or expired time never grants access", () => {
	const invalidTimes = [
		undefined, null, NaN, Infinity, -Infinity, 0, -1,
		"", String(now + 60000), [], {}, now + 0.5, now - 1,
		Number.MAX_SAFE_INTEGER + 1
	];
	for (const expiresAt of invalidTimes) {
		const result = decision([record({ expiresAt })]);
		assert.equal(result.ok, false, `invalid expiry: ${String(expiresAt)}`);
		assert.equal(result.status, 404);
	}
});

test("missing list, missing matching record and duplicate ID fail closed", () => {
	assert.equal(decision(null).status, 503);
	assert.equal(decision({ previews: [] }).status, 503);
	assert.equal(decision([]).status, 404);
	assert.equal(decision([record({ id: "other-id" })]).status, 404);
	assert.equal(decision([record(), record()]).error, "preview_lease_ambiguous");
});

test("revoked and stopped records cannot grant a running lease", () => {
	assert.equal(decision([record({ status: "stopped" })]).status, 404);
	assert.equal(decision([record({ revokedAt: new Date().toISOString() })]).status, 404);
});

test("malformed, remote and credential-bearing native URLs are denied", () => {
	for (const changedUrl of [
		undefined, null, "not-a-URL", "file:///etc/passwd",
		"http://example.com/index.html", "http://user:pass@127.0.0.1:5180/",
		"http://127.0.0.1:5180/index.html#private"
	]) {
		assert.equal(decision([record({ sourceUrl: changedUrl })]).status, 403);
	}
});

test("actual authority refuses a missing-expiry native response before HTTP", async () => {
	const calls = [];
	const context = {
		paramKinds: { GET: { previewId } },
		ws: { async sendTunnelRequest(owner, tunnel, payload) {
			calls.push(payload.action);
			return { ok: true, previews: [record({ expiresAt: undefined })] };
		} }
	};
	const result = await Authority.verify(context, {
		ownerAccountId: "synthetic-owner",
		tunnelName: "synthetic-device"
	}, { ok: true, target: sourceUrl });
	assert.equal(result.ok, false);
	assert.equal(result.status, 404);
	assert.deepEqual(calls, ["previewList"]);
});
