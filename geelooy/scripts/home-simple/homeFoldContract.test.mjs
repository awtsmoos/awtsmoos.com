//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const readHomeSource = relativePath => fs.readFileSync(path.resolve(here, relativePath), 'utf8');
const HERO_URL = 'https://awtsmoos.com/api/social/aliases/abarbanel/fileSystem/readFile?path=awtsmoosImages%2Fhomepage%2Fawtsmoos-home-hero.jpg';
const SHLIACH_URL = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/file_000000001aa071f5afcedcf09919246e.png';
const html = readHomeSource('../../index.html');
const imageCss = readHomeSource('../../style/home-simple/hero-image.css');
const copyCss = readHomeSource('../../style/home-simple/hero-copy.css');
const components = readHomeSource('../../style/home-simple/components.css');

test('original Awtsmoos hero remains first and eagerly discoverable', () => {
	assert.equal(html.split(HERO_URL).length - 1, 2);
	assert.match(html, /rel="preload" as="image"/);
	assert.match(html, /class="hero-media">[\s\S]*?<img class="hero-image"/);
	assert.doesNotMatch(components, /hero-art\.css/);
});

test('Shliach is a separate compact card after the main hero', () => {
	assert.ok(html.indexOf(HERO_URL) < html.indexOf(SHLIACH_URL.replace(' ', '')));
	assert.match(html, /<section class="shliach-home-section"[\s\S]*?class="shliach-home-shell" href="\/Shliach\/"/);
	assert.match(html, /<small>Build with Awtsmoos<\/small>/);
	assert.match(html, /class="shliach-home-banner-image"[\s\S]*?loading="lazy"/);
});

test('mobile hero stays compact while Shliach preserves its full artwork', () => {
	assert.match(imageCss, /aspect-ratio:\s*16 \/ 7/);
	assert.match(imageCss, /@media \(max-width:\s*760px\)/);
	assert.match(copyCss, /object-fit:\s*contain/);
	assert.match(copyCss, /shliach-home-section/);
	assert.match(copyCss, /max-height:\s*10\.5rem/);
});

test('home stops after discovery instead of repeating a second marketing catalog', () => {
	assert.doesNotMatch(html, /class="featured-worlds"/);
});

test('primary discovery remains reachable after the simplified hero', () => {
	assert.match(html, /class="search" action="\/mawgawl\/sefarim\/"/);
	assert.match(html, /data-world-id="torah"/);
	assert.match(html, /data-world-id="games"/);
	assert.match(html, /data-world-id="apps"/);
});
