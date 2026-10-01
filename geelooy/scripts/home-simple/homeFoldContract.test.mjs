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

test('Shliach is a compact visual banner directly beneath the original hero', () => {
	assert.ok(html.indexOf(HERO_URL) < html.indexOf(SHLIACH_URL.replace(' ', '')));
	assert.match(html, /class="shliach-home-banner" href="\/Shliach\/"/);
	assert.match(html, /<strong id="hero-title">Awtsmoos Shliach<\/strong>/);
	assert.match(html, /Build with Awtsmoos/);
	assert.doesNotMatch(html, /class="creation-form"/);
	assert.doesNotMatch(html, /What do you want to make\?/);
});

test('home hero is a simple one-column visual stack', () => {
	assert.match(imageCss, /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
	assert.match(copyCss, /grid-column:\s*1 \/ -1/);
	assert.match(copyCss, /aspect-ratio:\s*16 \/ 6/);
	assert.match(copyCss, /@media \(max-width:\s*760px\)/);
});

test('primary discovery remains reachable after the simplified hero', () => {
	assert.match(html, /class="search" action="\/mawgawl\/sefarim\/"/);
	assert.match(html, /data-world-id="torah"/);
	assert.match(html, /data-world-id="games"/);
	assert.match(html, /data-world-id="apps"/);
});
