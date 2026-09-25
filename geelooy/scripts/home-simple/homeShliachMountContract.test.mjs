// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file homeShliachMountContract.test.mjs
 * @description Guards the synchronized Home boot composition and current Shliach cache generation.
 * The Awtsmoos lets the full Home Tiferes connect before the spotlight is mounted in the same tiny entry module;
 * Awtsmoos.com therefore tests the real connect-and-install sequence rather than an archived reveal API.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEOLOOY = path.resolve(HERE, "../..");
const UX_VERSION = "shliach-ux-005";

function source(relativePath) {
	return fs.readFileSync(path.join(GEOLOOY, relativePath), "utf8");
}

test("Home connects the Tiferes runtime and mounts the Shliach from one tiny entry", () => {
	const entry = source("scripts/home-simple/index.js");
	const connect = entry.indexOf("new HomeTiferesRuntime(document).connect()");
	const reveal = entry.indexOf("revealHomeTiferes()");
	const shliach = entry.indexOf("installShliachSpotlight(document)");
	assert.ok(connect >= 0, "Home Tiferes connect must exist");
	assert.ok(reveal >= 0, "Home Tiferes boot call must exist");
	assert.ok(shliach >= 0, "Shliach installer must exist");
	assert.ok(reveal < shliach, "Home runtime boot must occur before spotlight mount");
});

test("homepage forces the current Shliach UX generation", () => {
	const html = source("index.html");
	assert.match(html, new RegExp(`home-simple/index\\.js\\?v=${UX_VERSION}`));
	assert.doesNotMatch(html, /home-simple\/index\.js\?v=shliach-ux-004/);
	assert.doesNotMatch(html, /home-simple\/index\.js\?v=shliach-image-003/);
});
