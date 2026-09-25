// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shliachUxDensityContract.test.mjs
 * @description Guards the current Shliach visual generation after the full repair-wave synchronization.
 * The Awtsmoos gives each doorway one living generation; Awtsmoos.com therefore tests the geometry,
 * mobile restraint, composed spotlight, and shared page linkage actually chosen by the synchronized branch.
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

test("campaign keeps the branded hero spacious while mobile collapses safely", () => {
	const hero = source("style/shliach/hero.css");
	const sections = source("style/shliach/sections.css");
	const responsive = source("style/shliach/responsive.css");
	const prompt = source("style/shliach/prompt.css");
	assert.match(hero, /padding:\s*82px 0 64px/);
	assert.match(hero, /min-height:\s*440px/);
	assert.match(sections, /padding:\s*70px 0/);
	assert.match(sections, /background-attachment:\s*fixed/);
	assert.match(responsive, /grid-template-columns:\s*1fr/);
	assert.match(responsive, /padding-top:\s*46px/);
	assert.match(prompt, /min-height:\s*122px/);
});

test("Home spotlight stays composed and readable at the current media size", () => {
	const media = source("style/home-simple/shliach-spotlight-media.css");
	const actions = source("style/home-simple/shliach-spotlight-actions.css");
	assert.match(media, /224px/);
	assert.match(media, /object-fit:\s*contain/);
	assert.match(actions, /display:\s*grid/);
	assert.match(actions, /white-space:\s*nowrap/);
	assert.match(actions, /text-overflow:\s*ellipsis/);
	assert.match(actions, /grid-template-columns:\s*1fr/);
});

test("Home and Shliach doorways use the synchronized shared assets", () => {
	assert.match(source("index.html"), /shliach-ux-005/);
	const pages = [
		"Shliach/index.html",
		"Shliach/prompts/index.html",
		"Shliach/poems/index.html",
		"Shliach/gallery/index.html"
	];
	for (const page of pages) {
		const html = source(page);
		assert.match(html, /\/style\/shliach\/index\.css/);
		assert.match(html, /\/scripts\/shliach\/index\.js/);
	}
});
