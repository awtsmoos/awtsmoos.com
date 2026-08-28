// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file searchFoldContract.test.mjs
 * @description
 * The Awtsmoos keeps truthful answers close while Awtsmoos.com lets secondary context rest below;
 * this contract protects the calm responsive vessels without reviving the sideways carousel of old.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const controller = source('./script.js');
const activeCss = source('./styles/active-search.css');
const formCss = source('./styles/form.css');
const mobileCss = source('./styles/mobile.css');
const mobileContextCss = source('./styles/mobile-context.css');
const page = source('./index.html');

test('a real query marks the workspace active before results render', () => {
	assert.match(controller, /document\.body\.dataset\.searchActive\s*=\s*['"]true['"]/);
});

test('active search compacts only current hero content', () => {
	assert.match(activeCss, /body\[data-search-active="true"\] \.library-hero\s*\{/);
	assert.match(activeCss, /\.library-hero-description,[\s\S]*\.library-trust-line[\s\S]*display:\s*none/);
	assert.doesNotMatch(activeCss, /library-truth-row|library-hero-mark|library-hero-copy/);
});

test('wide search form keeps core controls on one row', () => {
	assert.match(
		formCss,
		/grid-template-columns:\s*minmax\(16rem,\s*1\.35fr\)\s*minmax\(12rem,\s*\.55fr\)\s*minmax\(12rem,\s*\.55fr\)\s*auto/
	);
});

test('mobile context remains vertical and cache-versioned', () => {
	assert.match(
		mobileCss,
		/@import url\("\.\/mobile-context\.css\?v=living-search-context-002"\);/
	);
	assert.match(mobileContextCss, /grid-auto-flow:\s*row/);
	assert.match(mobileContextCss, /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
	assert.match(mobileContextCss, /overflow:\s*visible/);
	assert.doesNotMatch(mobileContextCss, /grid-auto-flow:\s*column|overflow-x:\s*auto|scroll-snap-type:\s*x/);
});

test('page loads the current search vessels', () => {
	assert.match(page, /form\.css\?v=living-search-008/);
	assert.match(page, /active-search\.css\?v=living-search-009/);
	assert.match(page, /mobile\.css\?v=living-search-011/);
	assert.match(page, /discovery-actions\.css\?v=living-search-actions-001/);
	assert.match(page, /script\.js\?v=living-search-009/);
});

for (const sourceText of [formCss, activeCss, mobileCss, mobileContextCss]) {
	assert.ok(sourceText.split('\n').length <= 120, 'search fold module exceeds 120 lines');
}
