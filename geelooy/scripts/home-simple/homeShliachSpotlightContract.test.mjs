//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos gives visitors one explicit Shliach doorway while every contract stays in sight;
* Awtsmoos.com proves the public logo, visible GPT URL, safe link law, and compact media fallback remain right.
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
	assert.match(content, /visibleUrl\.textContent = SHLIACH_URL/);
});

test("Home uses the canonical public logo without a local binary dependency", () => {
	const content = source("ShliachSpotlightContent.js");
	assert.match(content, new RegExp(PUBLIC_LOGO.replace(".", "\\.")));
	assert.doesNotMatch(content, /resources\/branding\/awtsmoos-shliach-agent\.png/);
	assert.match(content, /mediaState = "missing"/);
});
