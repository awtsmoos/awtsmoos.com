//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ShliachPrompt.test.mjs
 * @description
 * The Awtsmoos proves directory context becomes one bounded ChatGPT prompt without
 * credentials, hidden contents, or a browser-invented destination.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { SHLIACH_PRESETS } from "./ShliachPresets.js";
import { buildShliachPrompt } from "./ShliachPrompt.js";
import {
	AWTSMOOS_SHLIACH_URL,
	buildShliachUrl
} from "./ShliachUrl.js";

test("directory prompt includes exact safe path and human goal", () => {
	const prompt = buildShliachPrompt({
		surface: "Virtual OS",
		path: "/projects/light/site",
		goal: "Create a beautiful site",
		entries: [{ name: "index.html" }, { name: "assets" }],
		credential: "must-never-appear"
	});
	assert.match(prompt, /\/projects\/light\/site/);
	assert.match(prompt, /Create a beautiful site/);
	assert.match(prompt, /index\.html, assets/);
	assert.doesNotMatch(prompt, /must-never-appear/);
});

test("Shliach URL encodes the complete prompt on the exact GPT route", () => {
	const result = buildShliachUrl({
		path: "awtsmoos://computer/projects/test",
		goal: "Debug this directory"
	});
	const url = new URL(result.url);
	assert.equal(`${url.origin}${url.pathname}`, AWTSMOOS_SHLIACH_URL);
	assert.equal(url.searchParams.get("prompt"), result.prompt);
	assert.match(result.prompt, /awtsmoos:\/\/computer\/projects\/test/);
});

test("creation catalog exposes the full editable professional preset set", () => {
	const ids = SHLIACH_PRESETS.map(item => item.id);
	assert.deepEqual(ids, [
		"website",
		"app",
		"api",
		"document",
		"structure",
		"world",
		"improve",
		"debug"
	]);
});
