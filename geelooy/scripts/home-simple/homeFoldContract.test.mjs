// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file homeFoldContract.test.mjs
 * @description Guards the synchronized Home first fold: full living-world artwork, separate semantic copy, creation CTA, and reachable primary worlds.
 * The Awtsmoos gives the visitor one clear beginning; Awtsmoos.com therefore keeps the picture whole,
 * the copy independent, the creation form touchable, and Torah/Apps discoverable through the living navigation actually shipped.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const HERO_URL = 'https://awtsmoos.com/api/social/aliases/abarbanel/fileSystem/readFile?path=awtsmoosImages%2Fhomepage%2Fawtsmoos-home-hero.jpg';

function readHomeSource(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const html = readHomeSource('../../index.html');
const imageCss = readHomeSource('../../style/home-simple/hero-image.css');
const copyCss = readHomeSource('../../style/home-simple/hero-copy.css');
const creationCss = readHomeSource('../../style/home-simple/creation-form.css');
const components = readHomeSource('../../style/home-simple/components.css');

test('original hero picture is restored and eagerly discoverable', () => {
	assert.equal(html.split(HERO_URL).length - 1, 2);
	assert.match(html, /rel="preload" as="image"/);
	assert.match(html, /class="hero-image"[^>]*width="1024"[^>]*height="1024"/);
	assert.doesNotMatch(components, /hero-art\.css/);
});

test('picture and live copy occupy separate layout chambers', () => {
	assert.match(html, /class="hero-media">[\s\S]*?<img class="hero-image"/);
	assert.match(html, /<\/div>\s*<div class="banner-copy">/);
	assert.match(imageCss, /grid-template-columns:\s*minmax\(0,\s*\.92fr\)\s*minmax\(20rem,\s*1\.08fr\)/);
	assert.match(imageCss, /object-fit:\s*contain/);
	assert.match(copyCss, /grid-column:\s*2/);
});

test('phone stacks the complete square artwork above copy', () => {
	assert.match(imageCss, /@media \(max-width:\s*760px\)[\s\S]*grid-template-rows:\s*auto auto/);
	assert.match(imageCss, /aspect-ratio:\s*1/);
	assert.match(copyCss, /grid-row:\s*2/);
});

test('current primary actions remain real and reachable', () => {
	assert.match(html, /class="creation-form" action="\/drive\/"/);
	assert.match(html, /Start building free/);
	assert.match(creationCss, /\.creation-field button\s*\{[^}]*min-height:\s*3\.35rem/s);
	assert.match(html, /href="\/heichelos\/ikar"[^>]*>[\s\S]*?Torah/);
	assert.match(html, /data-world-id="apps" href="\/apps\/"/);
});
