// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file searchFoldContract.test.mjs
 * @description
 * The Awtsmoos raises truthful results toward the first viewport while Awtsmoos.com
 * keeps mobile context in a separate compact vessel beside the primary search path.
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

test('active search collapses landing-only hero content', () => {
	assert.match(activeCss, /body\[data-search-active="true"\] \.library-hero\s*\{/);
	assert.match(activeCss, /min-height:\s*7\.25rem/);
	assert.match(activeCss, /\.library-truth-row,[\s\S]*\.library-hero-mark[\s\S]*display:\s*none/);
});

test('wide search form fits query, mode, lane-or-book, and button on one row', () => {
	assert.match(
		formCss,
		/grid-template-columns:\s*minmax\(16rem,\s*1\.35fr\)\s*minmax\(12rem,\s*\.55fr\)\s*minmax\(12rem,\s*\.55fr\)\s*auto/
	);
});

test('mobile stylesheet delegates secondary context to a focused module', () => {
	assert.match(mobileCss, /@import url\("\.\/mobile-context\.css"\);/);
	assert.match(mobileContextCss, /\.library-discovery-rail\s*\{[\s\S]*grid-auto-flow:\s*column;/);
	assert.match(mobileContextCss, /\.library-discovery-rail\s*\{[\s\S]*overflow-x:\s*auto;/);
	assert.match(mobileContextCss, /scroll-snap-type:\s*x proximity;/);
	assert.match(mobileContextCss, /\.library-rail-card\s*\{[\s\S]*scroll-snap-align:\s*start;/);
});

test('page cache versions load the current compact search vessels', () => {
	assert.match(page, /form\.css\?v=living-search-008/);
	assert.match(page, /active-search\.css\?v=living-search-008/);
	assert.match(page, /script\.js\?v=living-search-009/);
});

for (const sourceText of [formCss, activeCss, mobileCss, mobileContextCss]) {
	assert.ok(sourceText.split('\n').length <= 120, 'search fold module exceeds 120 lines');
}
