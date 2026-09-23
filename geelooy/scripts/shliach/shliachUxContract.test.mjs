//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos proves mobile beauty stays dense, real markup owns real styles, and production uses only CompactCSS-safe leaves.
* @module shliachUxContract.test
*/

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEOLOOY = path.resolve(HERE, "../..");
const STYLE_VERSION = "shliach-ux-007";
const HOME_VERSION = "shliach-ux-005";
const STYLE_DIR = path.join(GEOLOOY, "style/shliach");

function source(relativePath) {
	return fs.readFileSync(path.join(GEOLOOY, relativePath), "utf8");
}

test("Shliach mobile layout removes giant spacing floors", () => {
	const hero = source("style/shliach/responsive-mobile-hero.css");
	const content = source("style/shliach/responsive-mobile-content.css");
	assert.match(content, /\.shliach-section\s*\{[^}]*padding:\s*38px 0/s);
	assert.match(hero, /\.shliach-logo-stage\s*\{[^}]*min-height:\s*0/s);
	assert.match(content, /\.shliach-scene\s*\{[^}]*min-height:\s*292px/s);
	assert.match(content, /background-attachment:\s*scroll/);
});

test("process cards become a swipeable mobile rail", () => {
	const content = source("style/shliach/responsive-mobile-content.css");
	assert.match(content, /grid-auto-flow:\s*column/);
	assert.match(content, /grid-auto-columns:\s*min\(82vw, 310px\)/);
	assert.match(content, /scroll-snap-type:\s*inline mandatory/);
	assert.match(content, /scroll-snap-align:\s*start/);
});

test("actual prompt, story, poem, and bridge classes own visual rules", () => {
	const prompt = source("style/shliach/prompt.css");
	const cards = source("style/shliach/section-cards.css");
	const scenes = source("style/shliach/section-scenes.css");
	const motion = source("style/shliach/motion.css");
	for (const selector of ["shliach-examples","shliach-example","shliach-prompt-row","shliach-prompt-status","shliach-prompt-button"]) {
		assert.match(prompt, new RegExp(`\\.${selector}`));
	}
	assert.match(cards, /\.shliach-story/);
	assert.match(cards, /\.shliach-poem/);
	assert.match(scenes, /\.shliach-bridge-scene/);
	assert.match(scenes, /12_awtsmoos_hat_logo_pilgrim_golden_bridge\.png/);
	assert.match(motion, /\.shliach-example/);
});

test("Shliach production CSS is import-free and pages use current direct leaves", () => {
	for (const name of fs.readdirSync(STYLE_DIR).filter(name => name.endsWith(".css"))) {
		assert.doesNotMatch(fs.readFileSync(path.join(STYLE_DIR, name), "utf8"), /@import\s/i, `${name} must not use nested stylesheet imports`);
	}
	for (const route of ["Shliach/index.html","Shliach/prompts/index.html","Shliach/poems/index.html","Shliach/gallery/index.html"]) {
		const html = source(route);
		assert.equal((html.match(/shliach-ux-007/g) ?? []).length, 12);
		assert.match(html, new RegExp(STYLE_VERSION));
		assert.doesNotMatch(html, /style\/shliach\/(?:index|connection|connection-motion|connection-responsive|onboarding)\.css/);
	}
});

test("Home spotlight stays compact on its independently proven generation", () => {
	const layout = source("style/home-simple/shliach-spotlight.css");
	const copy = source("style/home-simple/shliach-spotlight-copy.css");
	const actions = source("style/home-simple/shliach-spotlight-actions.css");
	const runtime = source("scripts/home-simple/ShliachSpotlight.js");
	assert.match(layout, /grid-template-columns:\s*124px minmax\(0, 1fr\)/);
	assert.match(copy, /-webkit-line-clamp:\s*3/);
	assert.match(copy, /\.shliach-spotlight-trust\s*\{[^}]*display:\s*none/s);
	assert.match(actions, /text-overflow:\s*ellipsis/);
	assert.match(runtime, new RegExp(HOME_VERSION));
});
