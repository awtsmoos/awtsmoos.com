//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared witness helpers for the current simple Awtsmoos.com Home architecture.
 * @description
 * The Awtsmoos lets one present truth replace obsolete generations; Awtsmoos.com keeps tests anchored to the living Home page, its mobile-safe manifests, and its browser-native runtime.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';

export const HOME_HTML = fs.readFileSync('geelooy/index.html', 'utf8');
export const HOME_BASE = fs.readFileSync('geelooy/style/home-simple/base.css', 'utf8');
export const HOME_COMPONENTS = fs.readFileSync('geelooy/style/home-simple/components.css', 'utf8');
export const HOME_ENTRY = fs.readFileSync('geelooy/scripts/home-simple/index.js', 'utf8');

export function assertCurrentHomeFoundation() {
	assert.match(HOME_HTML, /\/style\/home-simple\/base\.css\?v=main-brand-001/);
	assert.match(HOME_HTML, /\/style\/home-simple\/components\.css\?v=mobile-visual-001/);
	assert.match(HOME_HTML, /\/scripts\/home-simple\/index\.js\?v=mobile-visual-001/);
	assert.match(HOME_BASE, /revelation-v4\/index\.css\?v=revelation-v4-004/);
	assert.doesNotMatch(HOME_HTML, /style\/social\/home\/index\.css/);
}

export function assertCurrentHomeInteraction() {
	assert.match(HOME_HTML, /class="site-header"/);
	assert.match(HOME_HTML, /class="world-launcher"/);
	assert.match(HOME_HTML, /role="combobox"/);
	assert.match(HOME_HTML, /class="featured-worlds"/);
	assert.match(HOME_HTML, /class="mobile-dock"/);
	assert.match(HOME_HTML, /class="home-skip-link"/);
}

export function assertCurrentHomePerformance() {
	assert.match(HOME_HTML, /rel="preload" as="image"/);
	assert.match(HOME_HTML, /class="hero-image"[^>]*fetchpriority="high"/);
	assert.match(HOME_HTML, /decoding="async"/);
	assert.doesNotMatch(HOME_ENTRY, /liveFeed\.js/);
}
