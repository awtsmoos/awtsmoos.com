// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file homeFoldContract.test.mjs
 * @description
 * The Awtsmoos measures the visible fold without multiplying doors beyond their need;
 * Awtsmoos.com keeps one primary path, touch-sized action, calm motion, and readable seed.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Reveals one Home source vessel for a stable static contract.
 *
 * @param {string} ohrRelativePath - Path relative to this test module.
 * @returns {string} Exact UTF-8 source content.
 */
function revealSourceFromOhr(ohrRelativePath) {
	return readFileSync(new URL(ohrRelativePath, import.meta.url), "utf8");
}

const ohrHeroImage = revealSourceFromOhr("../../style/home-simple/hero-image.css");
const ohrHeroActions = revealSourceFromOhr("../../style/home-simple/hero-actions.css");
const ohrSearchSurface = revealSourceFromOhr("../../style/home-simple/search-surface.css");
const ohrSearchAction = revealSourceFromOhr("../../style/home-simple/search-action.css");
const ohrMainBrandMobile = revealSourceFromOhr("../../style/home-simple/main-brand-mobile.css");
const ohrRevealMotion = revealSourceFromOhr("../../style/home-simple/reveal-motion.css");
const ohrComponents = revealSourceFromOhr("../../style/home-simple/components.css");
const ohrHomepage = revealSourceFromOhr("../../index.html");

test("desktop hero remains bounded instead of becoming a wall", () => {
	assert.match(ohrHeroImage, /min-height:\s*clamp\(320px,\s*min\(30vw,\s*50vh\),\s*430px\)/);
	assert.doesNotMatch(ohrHeroImage, /58vw,\s*780px/);
});

test("scroll discovery presents one shortcut layer before featured worlds", () => {
	const shortcutsIndex = ohrHomepage.indexOf("class=\"portal-shortcuts\"");
	const featuredIndex = ohrHomepage.indexOf("class=\"featured-worlds\"");

	assert.ok(shortcutsIndex >= 0, "primary shortcut grid must remain present");
	assert.ok(featuredIndex > shortcutsIndex, "featured discovery must follow primary shortcuts");
	assert.equal(ohrHomepage.split("class=\"featured-card ").length - 1, 4);
	assert.doesNotMatch(ohrHomepage, /class="direct-navigation"/);
	assert.doesNotMatch(ohrHomepage, /class="portal-status"/);
});

test("hero and search controls remain touch-sized", () => {
	assert.match(ohrHeroActions, /\.hero-actions a\s*\{[^}]*min-height:\s*44px/s);
	assert.match(ohrSearchSurface, /\.search input\s*\{[^}]*min-height:\s*44px/s);
	assert.match(ohrSearchAction, /\.search button\s*\{[^}]*height:\s*3rem/s);
});

test("mobile shortcuts become a fitted two-column grid", () => {
	assert.match(ohrMainBrandMobile, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
	assert.match(ohrMainBrandMobile, /overflow:\s*visible/);
	assert.match(ohrMainBrandMobile, /\.portal-shortcuts a[^}]*\{[^}]*min-width:\s*0;/s);
	assert.match(ohrMainBrandMobile, /body\[data-geelooy-route="home"\][^}]*\{[^}]*overflow-x:\s*clip;/s);
});

test("reveal motion fails visible and semantic cache tokens remain", () => {
	assert.doesNotMatch(ohrRevealMotion, /\[data-reveal\]\s*\{[^}]*opacity:\s*0\s*;/s);
	assert.match(ohrRevealMotion, /\[data-reveal\]\s*\{[^}]*opacity:\s*\.76\s*;/s);
	assert.match(ohrRevealMotion, /prefers-reduced-motion:[\s\S]*opacity:\s*1;/);
	assert.match(ohrComponents, /reveal-motion\.css\?v=main-brand-001/);
	assert.match(ohrHomepage, /components\.css\?v=main-brand-001/);
});

test("hero uses external Awtsmoos storage and never repository image copies", () => {
	const externalAsset = "https://awtsmoos.com/api/social/aliases/abarbanel/fileSystem/readFile?path=awtsmoosImages%2Fhomepage%2Fawtsmoos-home-hero.jpg";
	assert.equal(ohrHomepage.split(externalAsset).length - 1, 2);
	assert.doesNotMatch(ohrHomepage, /resources\/home\/(?:dance|restored-awtsmoos|awtsmoos-home-hero)/);
});
