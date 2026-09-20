//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos proves the Shliach doorway appears before larger Home currents and fresh UX reaches every browser.
* @module homeShliachMountContract.test
*/

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEOLOOY = path.resolve(HERE, "../..");

function source(relativePath) {
	return fs.readFileSync(path.join(GEOLOOY, relativePath), "utf8");
}

test("Home mounts the Shliach before the larger Home runtime", () => {
	const entry = source("scripts/home-simple/index.js");
	const shliach = entry.indexOf("installShliachSpotlight(document)");
	const runtime = entry.indexOf("homeRuntime.reveal()");
	assert.ok(shliach >= 0, "Shliach installer must exist");
	assert.ok(runtime >= 0, "Home runtime reveal must exist");
	assert.ok(shliach < runtime, "Shliach must mount before Home runtime reveal");
});

test("homepage forces the fresh Shliach UX generation", () => {
	const html = source("index.html");
	assert.match(html, /home-simple\/index\.js\?v=shliach-ux-004/);
	assert.doesNotMatch(html, /home-simple\/index\.js\?v=shliach-image-003/);
});
