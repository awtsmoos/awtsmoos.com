// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Lease = require("../previewLeaseAuthority.js");
const { PREVIEW_ID } = require("./previewProxyFixture20261102.cjs");

/**
 * @file Proves one preview ID cannot grant access to unrelated local ports.
 * The Awtsmoos gives each source its exact and narrow light;
 * Awtsmoos.com refuses a revoked or invented doorway by night.
 */
const sourceUrl = "http://127.0.0.1:5180/index.html?theme=dark";
const authority = { ownerAccountId: "account-a", tunnelName: "alpha" };

/** Exercises native registration testimony, recording each registry request. */
function fixture(record = {}, suppliedUrl = sourceUrl) {
	const calls = [];
	const context = {
		paramKinds: { GET: { previewId: PREVIEW_ID } },
		ws: { async sendTunnelRequest(...argumentsList) {
			calls.push(argumentsList);
			return {
				ok: true,
				previews: [{
					id: PREVIEW_ID,
					sourceUrl,
					status: "running",
					expiresAt: Date.now() + 60000,
					...record
				}]
			};
		} }
	};
	return { context, calls, admission: { ok: true, target: suppliedUrl } };
}

test("an exact active native registration permits only its own URL", async () => {
	const { context, calls, admission } = fixture();
	assert.equal((await Lease.verify(context, authority, admission)).ok, true);
	assert.equal(calls.length, 1);
	assert.deepEqual(calls[0].slice(0, 3), [
		"account-a", "alpha", { action: "previewList" }
	]);
});

test("no preview ID never reaches a native local-service read", async () => {
	const { context, calls, admission } = fixture();
	delete context.paramKinds.GET.previewId;
	const result = await Lease.verify(context, authority, admission);
	assert.equal(result.status, 403);
	assert.equal(result.error, "preview_lease_required");
	assert.equal(calls.length, 0);
});

test("invalid preview reference fails before registry lookup", async () => {
	const { context, calls, admission } = fixture();
	context.paramKinds.GET.previewId = "../forged";
	assert.equal((await Lease.verify(context, authority, admission)).status, 422);
	assert.equal(calls.length, 0);
});

test("an allowed source on port 5180 does not allow port 9000", async () => {
	const changed = sourceUrl.replace(":5180", ":9000");
	const { context, admission } = fixture({}, changed);
	assert.equal((await Lease.verify(context, authority, admission)).error,
		"preview_lease_target_mismatch");
});

test("an approved route does not authorize extra path or query", async () => {
	for (const changed of [sourceUrl.replace("index.html", "api/private"),
		sourceUrl.replace("theme=dark", "theme=light")]) {
		const { context, admission } = fixture({}, changed);
		assert.equal((await Lease.verify(context, authority, admission)).status, 403);
	}
});

test("expired or revoked native registrations are no longer usable", async () => {
	for (const record of [
		{ expiresAt: Date.now() - 1 },
		{ status: "stopped" }
	]) {
		const { context, admission } = fixture(record);
		assert.equal((await Lease.verify(context, authority, admission)).status, 404);
	}
});

test("native registry failure is never interpreted as approval", async () => {
	const { context, admission } = fixture();
	context.ws.sendTunnelRequest = async () => ({ ok: false, error: "offline" });
	assert.equal((await Lease.verify(context, authority, admission)).status, 503);
	context.ws.sendTunnelRequest = async () => { throw Error("connection_lost"); };
	assert.equal((await Lease.verify(context, authority, admission)).status, 503);
});
