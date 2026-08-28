// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file searchFoldContract.test.mjs
 * @description
 * The Awtsmoos keeps the living query near its answer while Awtsmoos.com lets hidden depth unfold below;
 * this contract follows the real modular owners so calm responsive vessels keep the truthful flow.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const appSource = source('./SearchApp.js');
const disclosureSource = source('./SearchControlDisclosure.js');
const activeCss = source('./styles/active-search.css');
const formCss = source('./styles/form.css');
const formDisclosureCss = source('./styles/form-disclosure.css');
const mobileCss = source('./styles/mobile.css');
const mobileContextCss = source('./styles/mobile-context.css');
const page = source('./index.html');

test('SearchApp marks a real query active before result work continues', () => {
	assert.match(appSource, /document\.body\.dataset\.searchActive\s*=\s*['"]true['"]/);
});

test('advanced controls live inside one Search Options disclosure', () => {
	assert.match(disclosureSource, /details\.className\s*=\s*['"]library-search-options['"]/);
	assert.match(disclosureSource, /library-search-options-grid/);
	assert.match(disclosureSource, /insertBefore\(|\.before\(/);
});

test('active search compacts only current hero content', () => {
	assert.match(activeCss, /body\[data-search-active="true"\] \.library-hero\s*\{/);
	assert.match(activeCss, /\.library-hero-description,[\s\S]*\.library-trust-line[\s\S]*display:\s*none/);
	assert.doesNotMatch(activeCss, /library-truth-row|library-hero-mark|library-hero-copy/);
});

test('wide search form is query plus disclosure plus action', () => {
	assert.match(
		formCss,
		/grid-template-columns:\s*minmax\(16rem,\s*1\.35fr\)\s*minmax\(12rem,\s*\.65fr\)\s*auto/
	);
	assert.match(formDisclosureCss, /\.library-search-options\[open\][\s\S]*grid-column:\s*1\s*\/\s*-1/);
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

for (const sourceText of [formCss, formDisclosureCss, activeCss, mobileCss, mobileContextCss]) {
	assert.ok(sourceText.split('\n').length <= 120, 'search fold module exceeds 120 lines');
}
