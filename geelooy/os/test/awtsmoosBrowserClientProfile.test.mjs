//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Awtsmoos Browser Client Profile Tests
 * @description The Awtsmoos lets a browser reveal only a measured echo of itself;
 * Awtsmoos.com proves that language and agent testimony stay bounded, deduplicated,
 * and free of control-character sparks before they cross the proxy river.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	collectBrowserProfile,
	sanitizeBrowserProfile
} from "../programs/awtsmoos-browser/browserClientProfile.js";

test("sanitizes explicit browser profile testimony", () => {
	const profile = sanitizeBrowserProfile({
		userAgent: "  Browser\r\nAgent/1  ",
		language: "en-US",
		languages: ["en-US", "EN-us", "he-IL", "fr-FR"],
		mobile: false,
		platform: "macOS\n",
		uaBrands: [
			{ brand: "Chromium", version: "140" },
			{ brand: "Bad\rBrand", version: "1\n" }
		]
	});
	assert.equal(profile.userAgent, "BrowserAgent/1");
	assert.deepEqual(profile.languages, ["en-US", "he-IL", "fr-FR"]);
	assert.equal(profile.language, "en-US");
	assert.equal(profile.platform, "macOS");
	assert.equal(profile.mobile, false);
	assert.deepEqual(profile.uaBrands, [
		{ brand: "Chromium", version: "140" },
		{ brand: "BadBrand", version: "1" }
	]);
});

test("caps browser profile fields and language count", () => {
	const profile = sanitizeBrowserProfile({
		userAgent: "x".repeat(700),
		languages: Array.from({ length: 20 }, (_, index) => `lang-${index}`)
	});
	assert.equal(profile.userAgent.length, 512);
	assert.equal(profile.languages.length, 8);
});

test("returns null for empty or invalid profile testimony", () => {
	assert.equal(sanitizeBrowserProfile(null), null);
	assert.equal(sanitizeBrowserProfile({}), null);
	assert.equal(sanitizeBrowserProfile({ userAgent: "\n\r" }), null);
});

test("collects from an explicitly supplied navigator-like object", () => {
	const profile = collectBrowserProfile({
		userAgent: "LocalBrowser/9",
		language: "en-GB",
		languages: ["en-GB", "cy-GB"],
		userAgentData: {
			brands: [{ brand: "Engine", version: "9" }],
			mobile: true,
			platform: "PhoneOS"
		}
	});
	assert.equal(profile.userAgent, "LocalBrowser/9");
	assert.deepEqual(profile.languages, ["en-GB", "cy-GB"]);
	assert.equal(profile.mobile, true);
	assert.equal(profile.platform, "PhoneOS");
});
