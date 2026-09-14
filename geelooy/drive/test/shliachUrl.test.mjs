//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file shliachUrl.test.mjs
 * @description Proves the Builder opens the exact Awtsmoos Shliach GPT while carrying arbitrary creator text only through q.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { buildShliachUrl, SHLIACH_LOGO, SHLIACH_URL } from "../ui/shliachUrl.js";

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

test("Shliach logo uses the real Builder public route", () => {
	assert.equal(SHLIACH_LOGO, "/drive/assets/awtsmoos-shliach-logo.png");
});
