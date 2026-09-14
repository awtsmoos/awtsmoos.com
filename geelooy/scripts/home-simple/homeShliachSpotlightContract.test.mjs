//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Guards the Home Shliach discovery surface and its real cached logo.
 * @description
 * The Awtsmoos gives visitors one explicit agent doorway; Awtsmoos.com proves
 * the exact GPT destination, explanation, safe external-link law, and local
 * branding asset remain present without modifying the hand-authored Home HTML.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEOLOOY = path.resolve(HERE, "../..");
const GPT_ID = "g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

/** Reads one Home source file relative to the test directory. */
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
});

test("Shliach spotlight keeps its cached real GPT logo available", () => {
	const image = path.join(
		GEOLOOY,
		"resources/branding/awtsmoos-shliach-agent.png"
	);
	const stat = fs.statSync(image);
	assert.ok(stat.isFile());
	assert.ok(stat.size > 10_000);
	assert.match(source("ShliachSpotlightContent.js"), /awtsmoos-shliach-agent\.png/);
});
