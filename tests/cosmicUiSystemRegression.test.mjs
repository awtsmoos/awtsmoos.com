// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview
 * Guards the canonical cosmic UI covenant across Awtsmoos.com. The tests witness
 * tokens, controls, bounded effects, profile hierarchy, responsive home rhythm,
 * accessible creative pages, routes, and prior fixes. The Awtsmoos creates both
 * behavior and witness anew; this file records observable contracts.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { appRoutes } from '../geelooy/scripts/awtsmoos/social/shell/appRoutes.js';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '..');
const touchedStylePaths = [
	'geelooy/style/geelooy-app/tokens.css',
	'geelooy/style/geelooy-app/base/structure.css',
	'geelooy/style/geelooy-app/base/elements.css',
	'geelooy/style/geelooy-app/base/accessibility.css',
	'geelooy/style/geelooy-app/surfaces/controls.css',
	'geelooy/style/geelooy-app/surfaces/content.css',
	'geelooy/style/geelooy-app/performance/effects.css',
	'geelooy/style/geelooy-app/home/feed/cards.css',
	'geelooy/style/geelooy-app/pages/profile-spaces.css',
	'geelooy/style/civilization/core-tokens.css',
	'geelooy/style/civilization/core-components.css',
	'geelooy/style/civilization/profile-identity.css',
	'geelooy/style/civilization/profile-content.css',
	'geelooy/style/civilization/home-feed.css',
	'geelooy/style/civilization/home-layout.css',
	'geelooy/style/civilization/home-responsive.css'
];

function read(relativePath) {
	return fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

function assertBalancedBraces(source, relativePath) {
	let depth = 0;
	for (const character of source) {
		if (character === '{') {
			depth += 1;
		}
		if (character === '}') {
			depth -= 1;
		}
		assert.ok(depth >= 0, `${relativePath} closes a block before it opens`);
	}
	assert.equal(depth, 0, `${relativePath} has unbalanced CSS blocks`);
}

test('every rewritten style is documented, tab-indented, and structurally balanced', () => {
	for (const relativePath of touchedStylePaths) {
		const source = read(relativePath);
		assert.match(source, /^\/\* B"H/);
		assert.match(source, /Awtsmoos/);
		assert.match(source, /Awtsmoos\.com/);
		assert.doesNotMatch(source, /^ {2,}\S/gm);
		assertBalancedBraces(source, relativePath);
	}
});

test('the canonical token and control contracts expose complete interaction states', () => {
	const tokens = read('geelooy/style/geelooy-app/tokens.css');
	const controls = read('geelooy/style/geelooy-app/surfaces/controls.css');
	for (const token of [
		'--g-panel-gradient',
		'--g-control-field',
		'--g-control-hover',
		'--g-control-active',
		'--g-focus-ring'
	]) {
		assert.ok(tokens.includes(token), `missing ${token}`);
	}
	for (const state of [
		':hover',
		':focus-visible',
		':active',
		':disabled',
		'aria-pressed',
		'aria-selected'
	]) {
		assert.ok(controls.includes(state), `controls lack ${state}`);
	}
});

test('performance policy keeps effects bounded instead of erasing the design', () => {
	const effects = read('geelooy/style/geelooy-app/performance/effects.css');
	assert.match(effects, /prefers-reduced-motion/);
	assert.match(effects, /update: slow/);
	assert.match(effects, /g-unified-enter/);
	assert.doesNotMatch(effects, /filter:\s*none\s*!important/);
	assert.doesNotMatch(effects, /animation:\s*none\s*!important/);
	assert.doesNotMatch(effects, /transition:\s*none\s*!important/);
});

test('profile and home layouts preserve hierarchy at desktop and mobile widths', () => {
	const profileIdentity = read('geelooy/style/civilization/profile-identity.css');
	const profileContent = read('geelooy/style/civilization/profile-content.css');
	const homeLayout = read('geelooy/style/civilization/home-layout.css');
	const homeResponsive = read('geelooy/style/civilization/home-responsive.css');
	assert.match(profileIdentity, /grid-template-columns:\s*auto minmax\(0, 1fr\) auto/);
	assert.match(profileIdentity, /@media \(max-width: 680px\)/);
	assert.match(profileContent, /profile-living-grid/);
	assert.match(homeLayout, /minmax\(17rem, 23rem\)/);
	assert.match(homeResponsive, /@media \(max-width: 760px\)/);
	assert.match(homeResponsive, /env\(safe-area-inset-bottom\)/);
});

test('canonical routes remain unique, named, iconic, and self-matching', () => {
	const hrefs = appRoutes.map(route => route.href);
	assert.equal(new Set(hrefs).size, hrefs.length);
	for (const route of appRoutes) {
		assert.ok(route.label.trim(), `route ${route.href} lacks a label`);
		assert.ok(route.icon.trim(), `route ${route.href} lacks an icon`);
		assert.equal(route.match(route.href), true, `${route.href} does not match itself`);
	}
	const games = appRoutes.find(route => route.href === '/games');
	assert.equal(games?.icon, '🎮');
});

test('games search and the composer expose explicit accessible labels', () => {
	const games = read('geelooy/games/index.html');
	const composer = read('geelooy/heichelos/_awtsmoos.submitToHeichel.html');
	assert.match(games, /<label class="g-sr-only" for="gameSearch">/);
	assert.match(composer, /<label class="field-label" for="bulkText">/);
	assert.match(composer, /<label class="field-label" for="mainSectionDelimiters">/);
	assert.match(composer, /<label class="g-sr-only" for="fileInput">/);
	assert.match(composer, /contenteditable="true" role="textbox" aria-label="Post body"/);
	assert.match(composer, /aria-label="Verse content"/);
	assert.match(composer, /aria-label="Segment content"/);
});

test('prior comments and mobile profile fixes remain active', () => {
	const searchApi = read('geelooy/mawgawl/sefarim/searchApi.js');
	const mobileHeader = read('geelooy/style/geelooy-app/header/mobile.css');
	assert.match(searchApi, /comments:\s*'true'/);
	assert.match(mobileHeader, /--g-mobile-profile-min:\s*clamp\(7\.75rem, 38vw, 9rem\)/);
});
