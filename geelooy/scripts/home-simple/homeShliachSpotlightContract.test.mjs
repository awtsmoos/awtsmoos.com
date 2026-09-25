// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file homeShliachSpotlightContract.test.mjs
 * @description Guards the synchronized Home doorway to the actual Awtsmoos Shliach and its resilient public branding.
 * The Awtsmoos sends one Shliach through many vessels; Awtsmoos.com therefore proves the real GPT link,
 * honest capability copy, canonical public emblem, local image fallback, and final text fallback all remain present.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GPT_ID = "g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
const PUBLIC_LOGO = "file_000000001aa071f5afcedcf09919246e.png";
const LOCAL_FALLBACK = "/resources/branding/awtsmoos-shliach-agent.png";

function source(name) {
	return fs.readFileSync(path.join(HERE, name), "utf8");
}

test("Home boots the real Awtsmoos Shliach spotlight", () => {
	const entry = source("index.js");
	const content = source("ShliachSpotlightContent.js");
	assert.match(entry, /installShliachSpotlight\(document\)/);
	assert.match(content, new RegExp(GPT_ID));
	assert.match(content, /authenticated Awtsmoos APIs/);
	assert.match(content, /noopener noreferrer/);
	assert.match(content, /Open actual Shliach/);
	assert.match(content, /Explore the Shliach world/);
});

test("Home keeps public, local, and text branding fallbacks", () => {
	const content = source("ShliachSpotlightContent.js");
	assert.match(content, new RegExp(PUBLIC_LOGO.replace(".", "\\.")));
	assert.match(content, new RegExp(LOCAL_FALLBACK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
	assert.match(content, /usingFallback = true/);
	assert.match(content, /mediaState = "missing"/);
	assert.match(content, /fallback\.hidden = false/);
	assert.match(content, /Awtsmoos Shliach/);
});
