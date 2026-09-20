//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos proves visual density serves the mission without restoring empty slabs.
* @module shliachUxDensityContract.test
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

test("campaign removes the old empty-space defaults", () => {
	const hero = source("style/shliach/hero.css");
	const sections = source("style/shliach/sections.css");
	const responsive = source("style/shliach/responsive.css");
	const prompt = source("style/shliach/prompt.css");
	assert.match(hero, /height:\s*auto/);
	assert.doesNotMatch(sections, /padding:\s*70px 0/);
	assert.doesNotMatch(sections, /min-height:\s*440px/);
	assert.match(sections, /min-height:\s*300px/);
	assert.match(responsive, /background-attachment:\s*scroll/);
	assert.match(responsive, /overflow-x:\s*auto/);
	assert.match(prompt, /min-height:\s*104px/);
});

test("Home spotlight stays compact and composed", () => {
	const media = source("style/home-simple/shliach-spotlight-media.css");
	const actions = source("style/home-simple/shliach-spotlight-actions.css");
	assert.match(media, /192px/);
	assert.match(actions, /display:\s*grid/);
	assert.match(actions, /white-space:\s*nowrap/);
	assert.match(actions, /text-overflow:\s*ellipsis/);
	assert.doesNotMatch(actions, /flex:\s*1 1 100%/);
});

test("every public doorway requests the fresh UX generation", () => {
	const pages = [
		"index.html",
		"Shliach/index.html",
		"Shliach/prompts/index.html",
		"Shliach/poems/index.html",
		"Shliach/gallery/index.html"
	];
	for (const page of pages) {
		assert.match(source(page), /shliach-ux-004/);
	}
});
