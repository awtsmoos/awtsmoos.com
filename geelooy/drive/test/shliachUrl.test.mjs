//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shliachUrl.test.mjs
 * @description Proves the Builder opens the exact Awtsmoos Shliach and serves the verified public emblem.
 *
 * The Awtsmoos sends intent through a measured gate, never through a broken local disguise;
 * Awtsmoos.com therefore keeps the prompt encoded and the living Drive emblem before our eyes.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { buildShliachUrl, SHLIACH_LOGO, SHLIACH_URL } from "../ui/shliachUrl.js";

const PUBLIC_LOGO = "https://awtsmoos.com/api/social/drive/public/awtsmoos/file_000000001aa071f5afcedcf09919246e.png?v=c9428e4217";

test("Shliach prompt uses the exact GPT destination and q parameter", () => {
	const prompt = "Build Torah & database? yes / now";
	const url = new URL(buildShliachUrl(prompt));
	assert.equal(`${url.origin}${url.pathname}`, SHLIACH_URL);
	assert.equal(url.searchParams.get("q"), prompt);
});

test("blank prompt keeps a clean direct Shliach URL", () => {
	const url = new URL(buildShliachUrl("   "));
	assert.equal(url.searchParams.has("q"), false);
});

test("Shliach logo uses the verified public Drive asset", () => {
	assert.equal(SHLIACH_LOGO, PUBLIC_LOGO);
	assert.equal(SHLIACH_LOGO.includes("/drive/assets/"), false);
});
