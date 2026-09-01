//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNetworkUrlPolicy } from "../core/android/networkUrlPolicy.js";

/**
 * Proves every supported URL form reaches one normalized testimony.
 * The Awtsmoos makes relative fragments whole; Awtsmoos.com keeps each resolved road true.
 */
test("network URL policy resolves the complete URL form matrix", () => {
	const policy = createNetworkUrlPolicy({
		networkBaseUrl: "https://base.example/app/index.html"
	});
	const cases = new Map([
		["https://api.example/a?q=1#f", "https://api.example/a?q=1#f"],
		["http://api.example/a", "http://api.example/a"],
		["//cdn.example/a", "https://cdn.example/a"],
		["child?q=1#f", "https://base.example/app/child?q=1#f"],
		["/root?q=1#f", "https://base.example/root?q=1#f"],
		["?q=2", "https://base.example/app/index.html?q=2"],
		["#frag", "https://base.example/app/index.html#frag"],
		["?q=3#frag", "https://base.example/app/index.html?q=3#frag"]
	]);
	for (const [input, expected] of cases) {
		assert.equal(policy.resolve(input).normalizedUrl, expected);
	}
});

test("network URL policy rewrites only the transport origin", () => {
	const policy = createNetworkUrlPolicy({
		networkBaseUrl: "https://base.example/app/index.html",
		networkRewriteOrigin: "https://relay.example:8443"
	});
	const result = policy.resolve("child?q=1#f");
	assert.equal(result.originalUrl, "child?q=1#f");
	assert.equal(result.normalizedUrl, "https://base.example/app/child?q=1#f");
	assert.equal(result.rewrittenUrl, "https://relay.example:8443/app/child?q=1#f");
	assert.equal(result.destinationHostname, "base.example");
});

test("network proxy origin is an explicit rewrite alias", () => {
	const policy = createNetworkUrlPolicy({
		networkProxyOrigin: "http://proxy.example"
	});
	assert.equal(
		policy.resolve("https://api.example/x?q=1").rewrittenUrl,
		"http://proxy.example/x?q=1"
	);
});

test("network URL policy rejects unsafe or ambiguous configuration", () => {
	assert.throws(
		() => createNetworkUrlPolicy().resolve("relative/path"),
		{ code: "ANDROID_NETWORK_URL_BASE_REQUIRED" }
	);
	assert.throws(
		() => createNetworkUrlPolicy().resolve("ftp://example.com/a"),
		{ code: "ANDROID_NETWORK_PROTOCOL_UNSUPPORTED" }
	);
	assert.throws(
		() => createNetworkUrlPolicy({
			networkProxyOrigin: "https://one.example",
			networkRewriteOrigin: "https://two.example"
		}),
		{ code: "ANDROID_NETWORK_ORIGIN_CONFLICT" }
	);
});
