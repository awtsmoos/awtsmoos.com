//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Native Navigation Policy Tests
 * @description The Awtsmoos proves identity roads leave the embedded vessel only
 * when evidence demands it; Awtsmoos.com keeps ordinary pages local while unsafe
 * schemes and deceptive half-signals remain outside the gate.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	classifyNativeNavigation,
	normalizeNavigationUrl
} from "../programs/awtsmoos-browser/nativeNavigationPolicy.js";

test("Google account identity routes use the real native browser", () => {
	const decision = classifyNativeNavigation(
		"https://accounts.google.com/o/oauth2/v2/auth?client_id=x&redirect_uri=https://app.example/cb"
	);
	assert.equal(decision.mode, "native");
	assert.equal(decision.reason, "identity-provider");
});

test("ordinary Google pages remain eligible for embedded browsing", () => {
	const decision = classifyNativeNavigation("https://www.google.com/search?q=awtsmoos");
	assert.equal(decision.mode, "embedded");
	assert.equal(decision.reason, "ordinary-navigation");
});

test("known identity provider and OAuth paths route native", () => {
	assert.equal(
		classifyNativeNavigation("https://login.microsoftonline.com/common/oauth2/v2.0/authorize").mode,
		"native"
	);
	assert.equal(
		classifyNativeNavigation("https://appleid.apple.com/auth/authorize").mode,
		"native"
	);
	assert.equal(
		classifyNativeNavigation("https://github.com/login/oauth/authorize?client_id=x").mode,
		"native"
	);
});

test("generic authorization requires multiple OAuth signals", () => {
	const oauth = classifyNativeNavigation(
		"https://identity.example/authorize?client_id=x&redirect_uri=https://app.example/cb"
	);
	const ordinaryLogin = classifyNativeNavigation("https://shop.example/login?next=/account");
	assert.equal(oauth.mode, "native");
	assert.equal(oauth.reason, "oauth-authorization");
	assert.equal(ordinaryLogin.mode, "embedded");
});

test("explicit native mode overrides ordinary HTTP navigation", () => {
	const decision = classifyNativeNavigation("https://example.com/", { forceNative: true });
	assert.equal(decision.mode, "native");
	assert.equal(decision.reason, "user-selected-native");
});

test("unsafe schemes are blocked and relative URLs honor the supplied base", () => {
	assert.equal(classifyNativeNavigation("javascript:alert(1)").mode, "blocked");
	assert.equal(classifyNativeNavigation("file:///etc/passwd").mode, "blocked");
	const normalized = normalizeNavigationUrl("../next", "https://example.com/a/b/");
	assert.equal(normalized.href, "https://example.com/a/next");
});
