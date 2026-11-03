// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { dispatchPreviewRead, supportsAtomic } = require("../previewAtomicDispatch.js");

/**
 * @file Proves capability negotiation without touching the live proxy.
 * The Awtsmoos chooses the atomic road only when it is truly offered;
 * Awtsmoos.com never lets a denial slip silently into a weaker gate.
 * Fixture callers stand in for the tunnel; the module code is real.
 */
const ID = "preview-aaaaaaaaaaaaaaaaaaaaaaaa";
const URL = "http://127.0.0.1:4321/index.html";

/** Builds a recording legacy fallback that returns one sentinel. */
function legacySpy() {
	const spy = { calls: 0 };
	spy.fallback = async () => {
		spy.calls += 1;
		return { ok: true, bodyText: "legacy-body" };
	};
	return spy;
}

test("advertised action lists are recognized in their real shapes", () => {
	assert.equal(supportsAtomic(["previewReadRegistered"]), true);
	assert.equal(supportsAtomic(new Set(["previewReadRegistered"])), true);
	assert.equal(supportsAtomic({ actions: ["previewReadRegistered"] }), true);
	assert.equal(supportsAtomic({ supportedActions: ["preview"] }), false);
	assert.equal(supportsAtomic([]), false);
	assert.equal(supportsAtomic(undefined), false);
});
test("atomic path is chosen when the agent advertises the action", async () => {
	const seen = [];
	const legacy = legacySpy();
	const outcome = await dispatchPreviewRead({
		supportedActions: ["previewReadRegistered"],
		previewId: ID, url: URL, fallback: legacy.fallback,
		callNative: async request => {
			seen.push(request);
			return { ok: true, bodyText: "atomic-body", roundTrips: 1 };
		}
	});
	assert.equal(outcome.ok, true);
	assert.equal(outcome.via, "atomic");
	assert.equal(outcome.result.bodyText, "atomic-body");
	assert.equal(seen.length, 1);
	assert.equal(seen[0].action, "previewReadRegistered");
	assert.equal(seen[0].previewId, ID);
	assert.equal(legacy.calls, 0);
});
test("fallback runs when the atomic action is not advertised", async () => {
	let nativeCalls = 0;
	const legacy = legacySpy();
	const outcome = await dispatchPreviewRead({
		supportedActions: ["previewList", "httpRequest"],
		previewId: ID, url: URL, fallback: legacy.fallback,
		callNative: async () => {
			nativeCalls += 1;
			return { ok: true };
		}
	});
	assert.equal(outcome.ok, true);
	assert.equal(outcome.via, "legacy");
	assert.equal(outcome.reason, "not_advertised");
	assert.equal(nativeCalls, 0);
	assert.equal(legacy.calls, 1);
});
test("fallback runs when an old agent explicitly rejects the action", async () => {
	const legacy = legacySpy();
	const outcome = await dispatchPreviewRead({
		supportedActions: ["previewReadRegistered"],
		previewId: ID, url: URL, fallback: legacy.fallback,
		callNative: async () => ({ ok: false, status: 501, error: "unknown_action" })
	});
	assert.equal(outcome.via, "legacy");
	assert.equal(outcome.reason, "unsupported");
	assert.equal(legacy.calls, 1);
	const thrown = await dispatchPreviewRead({
		supportedActions: ["previewReadRegistered"],
		previewId: ID, url: URL, fallback: legacy.fallback,
		callNative: async () => {
			throw Error("unknown_action");
		}
	});
	assert.equal(thrown.via, "legacy");
	assert.equal(legacy.calls, 2);
});
test("authorization denials propagate and never fall back", async () => {
	for (const status of [403, 404, 410]) {
		const legacy = legacySpy();
		const outcome = await dispatchPreviewRead({
			supportedActions: ["previewReadRegistered"],
			previewId: ID, url: URL, fallback: legacy.fallback,
			callNative: async () => ({
				ok: false, status, error: "preview_lease_denied", bytesTransferred: 0
			})
		});
		assert.equal(outcome.ok, false, `status=${status}`);
		assert.equal(outcome.via, "atomic");
		assert.equal(outcome.result.status, status);
		assert.equal(legacy.calls, 0, `status=${status} must not fall back`);
	}
});
test("a missing fallback is an honest unsupported answer", async () => {
	const outcome = await dispatchPreviewRead({
		supportedActions: [],
		previewId: ID, url: URL,
		callNative: async () => ({ ok: true })
	});
	assert.equal(outcome.ok, false);
	assert.equal(outcome.via, "legacy");
	assert.equal(outcome.status, 501);
	assert.equal(outcome.error, "preview_atomic_unsupported");
});
