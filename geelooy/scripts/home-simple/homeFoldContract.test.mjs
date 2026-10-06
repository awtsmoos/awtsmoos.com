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
const SHLIACH_URL = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/file_000000001aa071f5afcedcf09919246e.png';
const html = readHomeSource('../../index.html');
const heroCss = readHomeSource('../../style/home-simple/shliach-hero.css');
const components = readHomeSource('../../style/home-simple/components.css');

test('Awtsmoos Shliach is the main hero with its artwork preloaded and eager', () => {
	assert.equal(html.split(SHLIACH_URL).length - 1, 2, 'shliach banner must be preloaded and rendered as the hero image');
	assert.match(html, /rel="preload" as="image"[^>]*file_000000001aa071f5afcedcf09919246e\.png/);
	assert.match(html, /<img class="shliach-hero-image"[^>]*fetchpriority="high"/);
	assert.doesNotMatch(html, /awtsmoos-home-hero\.jpg/, 'chopped legacy hero image must not render on home');
});

test('hero artwork always fills its card with no void', () => {
	assert.match(html, /<section class="hero hero-shliach" aria-label="Awtsmoos Shliach">/);
	assert.match(html, /<div class="shliach-hero-card">[\s\S]*?<div class="shliach-hero-media"[^>]*>[\s\S]*?<img class="shliach-hero-image"/);
	assert.match(heroCss, /\.shliach-hero-media\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0/s);
	assert.match(heroCss, /\.shliach-hero-image\s*\{[^}]*width:\s*100%[^}]*height:\s*100%[^}]*object-fit:\s*cover/s);
	assert.match(heroCss, /\.shliach-hero-scrim\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0/s);
});

test('search bar lives inside the hero', () => {
	const heroStart = html.indexOf('<section class="hero hero-shliach"');
	const heroEnd = html.indexOf('</main>');
	const heroSection = html.slice(heroStart, heroEnd);
	assert.ok(heroStart >= 0 && heroEnd > heroStart, 'hero section must precede main close');
	assert.match(heroSection, /data-omnibox-root/);
	assert.match(heroSection, /<form class="search" action="\/mawgawl\/sefarim\/"/);
	assert.match(heroSection, /id="home-search"/);
	assert.match(heroCss, /\.shliach-hero-content \.search-shell\s*\{[^}]*width:\s*100%/s);
});

test('hero title never clips', () => {
	assert.match(html, /<h1 class="shliach-hero-title">Awtsmoos Shliach<\/h1>/);
	assert.match(heroCss, /\.shliach-hero-title\s*\{[^}]*overflow-wrap:\s*anywhere/s);
	assert.doesNotMatch(heroCss, /\.shliach-hero-title\s*\{[^}]*white-space:\s*nowrap/s);
	assert.doesNotMatch(html, /class="shliach-home-section"/, 'legacy static shliach card is subsumed by the hero');
});

test('legacy chopped hero vessels are gone from the markup', () => {
	assert.doesNotMatch(html, /dance-shell/);
	assert.doesNotMatch(html, /class="hero-media"/);
	assert.doesNotMatch(html, /class="hero-image"/);
	assert.doesNotMatch(html, /class="action-panel"/);
});

test('hero stylesheet is wired through the component bundle', () => {
	assert.match(components, /@import url\("\.\/shliach-hero\.css\?v=shliach-hero-001"\);/);
});

test('home stops after discovery instead of repeating a second marketing catalog', () => {
	assert.doesNotMatch(html, /class="featured-worlds"/);
});

test('primary discovery remains reachable after the hero rebuild', () => {
	assert.match(html, /data-world-id="torah"/);
	assert.match(html, /data-world-id="games"/);
	assert.match(html, /data-world-id="apps"/);
	assert.match(html, /href="\/Shliach\/"/);
});
