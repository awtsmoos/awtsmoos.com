//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos proves mobile beauty stays dense and every Shliach stylesheet arrives from one coherent cache generation.
* @module shliachUxContract.test
*/

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEOLOOY = path.resolve(HERE, "../..");
const SHLIACH_STYLE_VERSION = "shliach-ux-006";
const HOME_SPOTLIGHT_VERSION = "shliach-ux-005";

function source(relativePath) {
	return fs.readFileSync(path.join(GEOLOOY, relativePath), "utf8");
}

test("Shliach mobile layout removes giant spacing floors", () => {
	const hero = source("style/shliach/responsive-mobile-hero.css");
	const content = source("style/shliach/responsive-mobile-content.css");
	const tablet = source("style/shliach/responsive-tablet.css");
	assert.match(content, /\.shliach-section\s*\{[^}]*padding:\s*38px 0/s);
	assert.match(hero, /\.shliach-logo-stage\s*\{[^}]*min-height:\s*0/s);
	assert.match(content, /\.shliach-scene\s*\{[^}]*min-height:\s*292px/s);
	assert.match(tablet, /background-attachment:\s*scroll/);
});

test("process cards become a swipeable mobile rail", () => {
	const content = source("style/shliach/responsive-mobile-content.css");
	assert.match(content, /grid-auto-flow:\s*column/);
	assert.match(content, /grid-auto-columns:\s*min\(82vw, 310px\)/);
	assert.match(content, /scroll-snap-type:\s*inline mandatory/);
	assert.match(content, /scroll-snap-align:\s*start/);
});

test("Shliach CSS graph uses one fresh generation at every import edge", () => {
	const files = ["index.css", "sections.css", "responsive.css", "responsive-mobile.css"];
	for (const name of files) {
		const css = source(`style/shliach/${name}`);
		assert.match(css, new RegExp(SHLIACH_STYLE_VERSION));
		assert.doesNotMatch(css, /shliach-ux-004|shliach-ux-005/);
	}
	assert.match(source("style/shliach/sections.css"), /section-cards\.css\?v=shliach-ux-006/);
	assert.match(source("style/shliach/sections.css"), /section-scenes\.css\?v=shliach-ux-006/);
	assert.match(source("style/shliach/responsive.css"), /responsive-mobile\.css\?v=shliach-ux-006/);
	assert.match(source("style/shliach/responsive-mobile.css"), /responsive-mobile-content\.css\?v=shliach-ux-006/);
});

test("Home spotlight stays compact on its independently proven generation", () => {
	const layout = source("style/home-simple/shliach-spotlight.css");
	const media = source("style/home-simple/shliach-spotlight-media.css");
	const copy = source("style/home-simple/shliach-spotlight-copy.css");
	const actions = source("style/home-simple/shliach-spotlight-actions.css");
	const runtime = source("scripts/home-simple/ShliachSpotlight.js");
	assert.match(layout, /grid-template-columns:\s*124px minmax\(0, 1fr\)/);
	assert.match(media, /max-width:\s*124px/);
	assert.match(copy, /-webkit-line-clamp:\s*3/);
	assert.match(copy, /\.shliach-spotlight-trust\s*\{[^}]*display:\s*none/s);
	assert.match(actions, /text-overflow:\s*ellipsis/);
	assert.match(runtime, new RegExp(HOME_SPOTLIGHT_VERSION));
});
