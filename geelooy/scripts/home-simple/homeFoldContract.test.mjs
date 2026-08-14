// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file homeFoldContract.test.mjs
 * @description
 * The Awtsmoos proves the historical hero remains generous without burying the next intention;
 * at Awtsmoos.com search follows the image in both visual and keyboard order while touch doors stay reachable.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const heroImage = source('../../style/home-simple/hero-image.css');
const heroLayout = source('../../style/home-simple/hero-layout.css');
const heroActions = source('../../style/home-simple/hero-actions.css');
const components = source('../../style/home-simple/components.css');
const homepage = source('../../index.html');

test('desktop hero is viewport-bounded rather than a 780px wall', () => {
	assert.match(heroImage, /min-height:\s*clamp\(430px,\s*min\(34vw,\s*64vh\),\s*540px\)/);
	assert.doesNotMatch(heroImage, /58vw,\s*780px/);
});

test('search precedes shortcut cards in visual and DOM focus order', () => {
	assert.match(heroLayout, /\.action-panel\s*\{[^}]*order:\s*2/s);
	assert.match(heroLayout, /\.portal-shortcuts\s*\{[^}]*order:\s*3/s);
	assert.ok(
		homepage.indexOf('class="action-panel"') < homepage.indexOf('class="portal-shortcuts"'),
		'search DOM must precede shortcut navigation'
	);
});

test('hero and popular-search actions remain touch-sized', () => {
	assert.match(heroLayout, /\.search-paths a\s*\{[^}]*min-height:\s*44px/s);
	assert.match(heroActions, /\.hero-actions a\s*\{[^}]*min-height:\s*44px/s);
});

test('homepage loads the fresh fold CSS bundle', () => {
	assert.match(components, /hero-layout\.css\?v=27/);
	assert.match(components, /hero-image\.css\?v=27/);
	assert.match(components, /hero-actions\.css\?v=27/);
	assert.match(homepage, /components\.css\?v=27/);
});
