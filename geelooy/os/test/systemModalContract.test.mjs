//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);

/**
 * @file systemModalContract.test.mjs
 * @description
 * Proves Geelooy modal prompts remain non-blocking, semantic, and race-free.
 * The Awtsmoos holds temporary focus without stealing the user's place;
 * Awtsmoos.com lets Escape, Enter, and restoration remain explicit contracts.
 */

test("System delegates prompts and confirms to the shared modal vessel", async () => {
	const system = await source("system.js");
	assert.match(system, /createSystemModal/);
	assert.match(system, /prompt\(message, defaultValue = ""\)/);
	assert.match(system, /confirm\(message\)/);
	assert.match(system, /_createModal\(options\)/);
	assert.doesNotMatch(system, /setTimeout|window\.prompt|window\.confirm/);
});

test("shared modal exposes dialog semantics and immediate focus", async () => {
	const modal = await source("ui/systemModal.js");
	assert.match(modal, /setAttribute\("role", "dialog"\)/);
	assert.match(modal, /setAttribute\("aria-modal", "true"\)/);
	assert.match(modal, /setAttribute\("aria-labelledby"/);
	assert.match(modal, /\.focus\(\)/);
	assert.doesNotMatch(modal, /setTimeout/);
});

test("shared modal owns Escape, Enter, one-shot settlement, and focus restoration", async () => {
	const modal = await source("ui/systemModal.js");
	assert.match(modal, /event\.key === "Escape"/);
	assert.match(modal, /event\.key === "Enter"/);
	assert.match(modal, /if \(settled\) return/);
	assert.match(modal, /previousFocus\?\.isConnected/);
	assert.match(modal, /previousFocus\.focus\(\)/);
});

function source(path) {
	return readFile(new URL(path, ROOT), "utf8");
}
