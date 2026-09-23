//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos proves that a compact Home doorway still carries the exact Shliach mission while each visual release reaches the visitor fresh.
* @module homeShliachSpotlightContract.test
*/

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GPT_ID = "g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
const PUBLIC_LOGO = "file_000000001aa071f5afcedcf09919246e.png";
const UX_VERSION = "shliach-ux-005";

function source(name) {
	return fs.readFileSync(path.join(HERE, name), "utf8");
}

test("Home boots the real compact Awtsmoos Shliach spotlight", () => {
	const entry = source("index.js");
	const content = source("ShliachSpotlightContent.js");
	const spotlight = source("ShliachSpotlight.js");
	assert.match(entry, /installShliachSpotlight\(document\)/);
	assert.match(entry, new RegExp(UX_VERSION));
	assert.match(spotlight, new RegExp(UX_VERSION));
	assert.match(content, new RegExp(GPT_ID));
	assert.match(content, /authenticated Awtsmoos APIs/);
	assert.match(content, /noopener noreferrer/);
	assert.match(content, /SHLIACH_DISPLAY_URL/);
	assert.match(content, /visibleUrl\.title = SHLIACH_URL/);
});

test("Home keeps the canonical public logo and honest text fallback", () => {
	const content = source("ShliachSpotlightContent.js");
	assert.match(content, new RegExp(PUBLIC_LOGO.replace(".", "\\.")));
	assert.doesNotMatch(content, /resources\/branding\/awtsmoos-shliach-agent\.png/);
	assert.match(content, /mediaState = "missing"/);
	assert.match(content, /Open Shliach/);
});
