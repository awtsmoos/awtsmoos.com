//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Browser Navigation Policy Tests
 * @description The Awtsmoos proves one address receives one truthful execution road;
 * Awtsmoos.com prefers the local browser when available, preserves measured fallbacks,
 * and lets identity-provider evidence outrank every embedded preference.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { chooseBrowserNavigation } from "../programs/awtsmoos-browser/browserNavigationPolicy.js";

test("identity provider decisions always outrank embedded preference", () => {
	const decision = chooseBrowserNavigation("https://accounts.google.com/", {
		embeddedAvailable: true,
		preferredMode: "embedded"
	});
	assert.equal(decision.mode, "native");
	assert.equal(decision.reason, "identity-provider");
});

test("automatic mode prefers embedded local-browser execution", () => {
	const decision = chooseBrowserNavigation("https://example.com/", {
		embeddedAvailable: true,
		merkavaSandboxAvailable: true,
		proxyFallbackAvailable: true
	});
	assert.equal(decision.mode, "embedded");
	assert.equal(decision.reason, "embedded-available");
});

test("automatic mode falls back to proxy when embedded mode is unavailable", () => {
	const decision = chooseBrowserNavigation("https://example.com/", {
		embeddedAvailable: false,
		proxyFallbackAvailable: true
	});
	assert.equal(decision.mode, "proxy-fallback");
	assert.equal(decision.reason, "embedded-unavailable");
});

test("Merkava sandbox becomes the final available fallback", () => {
	const decision = chooseBrowserNavigation("https://example.com/", {
		embeddedAvailable: false,
		merkavaSandboxAvailable: true,
		proxyFallbackAvailable: false
	});
	assert.equal(decision.mode, "merkava-sandbox");
	assert.equal(decision.reason, "proxy-unavailable");
});

test("explicit mode is honored when available and degrades safely when unavailable", () => {
	const sandbox = chooseBrowserNavigation("https://example.com/", {
		merkavaSandboxAvailable: true,
		preferredMode: "merkava-sandbox",
		proxyFallbackAvailable: true
	});
	const embeddedFallback = chooseBrowserNavigation("https://example.com/", {
		embeddedAvailable: false,
		preferredMode: "embedded",
		proxyFallbackAvailable: true
	});
	assert.equal(sandbox.mode, "merkava-sandbox");
	assert.equal(sandbox.reason, "user-selected-mode");
	assert.equal(embeddedFallback.mode, "proxy-fallback");
});

test("explicit native mode and unsafe schemes never enter embedded execution", () => {
	assert.equal(
		chooseBrowserNavigation("https://example.com/", { preferredMode: "native" }).mode,
		"native"
	);
	assert.equal(
		chooseBrowserNavigation("javascript:alert(1)", { embeddedAvailable: true }).mode,
		"blocked"
	);
});

test("navigation blocks when no execution mode is available", () => {
	const decision = chooseBrowserNavigation("https://example.com/", {
		embeddedAvailable: false,
		merkavaSandboxAvailable: false,
		proxyFallbackAvailable: false
	});
	assert.equal(decision.mode, "blocked");
	assert.equal(decision.reason, "no-browser-mode-available");
});
