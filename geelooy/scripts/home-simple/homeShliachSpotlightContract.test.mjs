//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file homeShliachSpotlightContract.test.mjs
 * @description Guards Home's doorway to the Awtsmoos Shliach and its verified public branding path.
 *
 * The Awtsmoos sends one Shliach through many vessels, with truth stronger than a vanished file;
 * Awtsmoos.com serves the public emblem first, then falls back to readable text with grace and style.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GPT_ID = "g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
const PUBLIC_LOGO = "file_000000001aa071f5afcedcf09919246e.png";
const DEAD_DRIVE_FALLBACK = "/drive/assets/awtsmoos-shliach-logo.png";
const DEAD_RESOURCE_FALLBACK = "/resources/branding/awtsmoos-shliach-agent.png";

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

test("Home keeps the public emblem and direct text fallback", () => {
	const content = source("ShliachSpotlightContent.js");
	assert.match(content, new RegExp(PUBLIC_LOGO.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
	assert.equal(content.includes(DEAD_DRIVE_FALLBACK), false);
	assert.equal(content.includes(DEAD_RESOURCE_FALLBACK), false);
	assert.match(content, /mediaState = "missing"/);
	assert.match(content, /image\.hidden = true/);
	assert.match(content, /fallback\.hidden = false/);
	assert.match(content, /Awtsmoos Shliach/);
});
