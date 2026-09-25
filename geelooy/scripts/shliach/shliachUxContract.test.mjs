// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shliachUxContract.test.mjs
 * @description Guards the synchronized Shliach UX architecture preserved by the full repair wave.
 * The Awtsmoos lets one stylesheet crown gather many clear leaves; Awtsmoos.com therefore proves
 * responsive density, real semantic selectors, shared page assets, and the current Home spotlight composition.
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

test("prompt, story, poem, bridge, and motion rules match real markup", () => {
	const prompt = source("style/shliach/prompt.css");
	const cards = source("style/shliach/section-cards.css");
	const scenes = source("style/shliach/section-scenes.css");
	const motion = source("style/shliach/motion.css");
	for (const selector of ["shliach-examples", "shliach-example", "shliach-prompt-row", "shliach-prompt-status", "shliach-prompt-button"]) {
		assert.match(prompt, new RegExp(`\\.${selector}`));
	}
	assert.match(cards, /\.shliach-story/);
	assert.match(cards, /\.shliach-poem/);
	assert.match(scenes, /\.shliach-bridge-scene/);
	assert.match(scenes, /12_awtsmoos_hat_logo_pilgrim_golden_bridge\.png/);
	assert.match(motion, /\[data-reveal\]/);
	assert.match(motion, /prefers-reduced-motion:\s*reduce/);
});

test("Shliach pages share the stylesheet crown and module doorway", () => {
	const indexCss = source("style/shliach/index.css");
	for (const leaf of ["tokens", "foundation", "navigation", "hero", "sections", "prompt", "motion", "responsive"]) {
		assert.match(indexCss, new RegExp(`@import url\\("\\./${leaf}\\.css"\\)`));
	}
	for (const route of ["Shliach/index.html", "Shliach/prompts/index.html", "Shliach/poems/index.html", "Shliach/gallery/index.html"]) {
		const html = source(route);
		assert.match(html, /\/style\/shliach\/index\.css/);
		assert.match(html, /\/scripts\/shliach\/index\.js/);
	}
});

test("Home spotlight uses the synchronized spacious responsive composition", () => {
	const layout = source("style/home-simple/shliach-spotlight.css");
	const copy = source("style/home-simple/shliach-spotlight-copy.css");
	const actions = source("style/home-simple/shliach-spotlight-actions.css");
	assert.match(layout, /grid-template-columns:\s*minmax\(190px, 280px\) minmax\(0, 1fr\)/);
	assert.match(layout, /@media \(max-width:\s*720px\)/);
	assert.match(layout, /grid-template-columns:\s*1fr/);
	assert.match(copy, /\.shliach-spotlight-trust/);
	assert.match(actions, /text-overflow:\s*ellipsis/);
	assert.match(actions, /grid-template-columns:\s*1fr/);
});
