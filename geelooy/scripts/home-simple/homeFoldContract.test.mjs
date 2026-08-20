// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file homeFoldContract.test.mjs
 * @description
 * The Awtsmoos measures the finite vessels of Awtsmoos.com so a regression cannot erase useful doors:
 * the hero stays external, the scroll grid remains present, and motion may decorate but never hide the way.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Reveals one source vessel as text for contract inspection.
 * @param {string} ohrRelativePath Path whose letters should be read.
 * @returns {string} The revealed source text.
 */
function revealSourceFromOhr(ohrRelativePath) {
	return readFileSync(new URL(ohrRelativePath, import.meta.url), 'utf8');
}

const ohrHeroImage = revealSourceFromOhr('../../style/home-simple/hero-image.css');
const ohrHeroLayout = revealSourceFromOhr('../../style/home-simple/hero-layout.css');
const ohrHeroActions = revealSourceFromOhr('../../style/home-simple/hero-actions.css');
const ohrPortalShortcuts = revealSourceFromOhr('../../style/home-simple/portal-shortcuts.css');
const ohrRevealMotion = revealSourceFromOhr('../../style/home-simple/reveal-motion.css');
const ohrComponents = revealSourceFromOhr('../../style/home-simple/components.css');
const ohrHomepage = revealSourceFromOhr('../../index.html');

test('desktop hero is bounded instead of becoming a wall', () => {
	assert.match(ohrHeroImage, /min-height:\s*clamp\(320px,\s*min\(30vw,\s*50vh\),\s*430px\)/);
	assert.doesNotMatch(ohrHeroImage, /58vw,\s*780px/);
});

test('scroll discovery keeps shortcuts, direct doors, then the four-card grid', () => {
	const shortcutsIndex = ohrHomepage.indexOf('class="portal-shortcuts"');
	const directIndex = ohrHomepage.indexOf('class="direct-navigation"');
	const featuredIndex = ohrHomepage.indexOf('class="featured-worlds"');

	assert.ok(shortcutsIndex < directIndex, 'shortcut ribbon must precede direct navigation');
	assert.ok(directIndex < featuredIndex, 'direct navigation must precede the large card grid');
	assert.equal(ohrHomepage.split('class="featured-card ').length - 1, 4);
	assert.match(ohrHomepage, /Four powerful ways into Awtsmoos\./);
});

test('hero and popular-search actions remain touch-sized', () => {
	assert.match(ohrHeroLayout, /\.search-paths a\s*\{[^}]*min-height:\s*44px/s);
	assert.match(ohrHeroActions, /\.hero-actions a\s*\{[^}]*min-height:\s*44px/s);
});

test('mobile shortcuts become one horizontal ribbon instead of a wall', () => {
	assert.match(ohrPortalShortcuts, /@media \(max-width:\s*680px\)[\s\S]*grid-template-columns:\s*none;/);
	assert.match(ohrPortalShortcuts, /@media \(max-width:\s*680px\)[\s\S]*grid-auto-flow:\s*column;/);
	assert.match(ohrPortalShortcuts, /@media \(max-width:\s*680px\)[\s\S]*overflow-x:\s*auto;/);
	assert.match(ohrPortalShortcuts, /scroll-snap-type:\s*x proximity;/);
});

test('reveal motion fails visible and the fresh cache key ships it', () => {
	assert.doesNotMatch(ohrRevealMotion, /\[data-reveal\]\s*\{[^}]*opacity:\s*0\s*;/s);
	assert.match(ohrRevealMotion, /\[data-reveal\]\s*\{[^}]*opacity:\s*\.76\s*;/s);
	assert.match(ohrRevealMotion, /prefers-reduced-motion:[\s\S]*opacity:\s*1;/);
	assert.match(ohrComponents, /reveal-motion\.css\?v=30/);
	assert.match(ohrHomepage, /components\.css\?v=30/);
});

test('hero uses external Awtsmoos storage and never a repository image', () => {
	const externalAsset = 'https://awtsmoos.com/api/social/aliases/abarbanel/fileSystem/readFile?path=awtsmoosImages%2Fhomepage%2Fawtsmoos-home-hero.jpg';

	assert.equal(ohrHomepage.split(externalAsset).length - 1, 2);
	assert.doesNotMatch(ohrHomepage, /resources\/home\/(?:dance|restored-awtsmoos|awtsmoos-home-hero)/);
});
