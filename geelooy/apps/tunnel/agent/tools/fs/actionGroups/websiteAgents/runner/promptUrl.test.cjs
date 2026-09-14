//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const { buildPromptUrl } = require("./promptUrl.js");

const BASE = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

/**
 * @file Proves one exact website-agent prompt becomes only a disposable URL query.
 * @description
 * The canonical Shliach path remains stable while multiline and Unicode prompt text
 * round-trips through URLSearchParams without mutation or conversation suffixes.
 */
test("buildPromptUrl round-trips the exact Shliach prompt", () => {
	const prompt = "B\"H\nRepair turn 7 exactly.\nשלום";
	const result = new URL(buildPromptUrl(BASE, prompt));
	assert.equal(result.origin + result.pathname, BASE);
	assert.equal(result.searchParams.get("prompt"), prompt);
	assert.equal(result.hash, "");
});

test("buildPromptUrl rejects a foreign target", () => {
	assert.throws(
		() => buildPromptUrl("https://example.com/g/fake", "B\"H"),
		error => error.code === "invalid_prompt_target_origin"
	);
});
