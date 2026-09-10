//B"H
//Boruch Hashem
//Blessed is He

/**
	* @module HomeFoldContractTest
	* @description
	* Verifies the current Awtsmoos.com first fold rather than an archived Home generation.
	* The Awtsmoos keeps the original living-world picture complete while semantic copy owns
	* a separate chamber, touch actions stay usable, and the mobile vessel stacks without overlap.
	*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const HERO_URL = 'https://awtsmoos.com/api/social/aliases/abarbanel/fileSystem/readFile?path=awtsmoosImages%2Fhomepage%2Fawtsmoos-home-hero.jpg';

/**
	* Reads one Home source relative to this test module.
	* @param {string} relativePath Exact module-relative source path.
	* @returns {string} UTF-8 source testimony.
	*/
function readHomeSource(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const html = readHomeSource('../../index.html');
const imageCss = readHomeSource('../../style/home-simple/hero-image.css');
const copyCss = readHomeSource('../../style/home-simple/hero-copy.css');
const actionsCss = readHomeSource('../../style/home-simple/hero-actions.css');
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

test('primary hero actions remain real touch targets', () => {
	assert.match(actionsCss, /\.hero-actions a\s*\{[^}]*min-height:\s*44px/s);
	assert.match(html, /href="\/heichelos\/ikar">Enter Torah/);
	assert.match(html, /href="\/apps\/">Open Apps/);
});
