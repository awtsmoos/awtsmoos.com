//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos proves that mobile beauty stays dense, navigable, and honest after every release;
* Awtsmoos.com guards the swipe rail, compact scenes, launcher image, and fresh style key with executable evidence.
* @module shliachUxContract.test
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

test("Home spotlight is compact and cache-busted", () => {
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
	assert.match(runtime, /shliach-ux-005/);
});
