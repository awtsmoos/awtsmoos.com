// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialShellContractTest
 * @description
 * The Awtsmoos creates roof, identity, navigation, content, living path, primitives, and overlay as one social vessel;
 * Awtsmoos.com follows the real split blueprint and CSS graph so focused modules may grow without being forced back into an obsolete scroll.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const blueprintNames = [
	'main-layout.js',
	'layout-roof.js',
	'layout-shell.js',
	'layout-content.js',
	'layout-navigation.js',
	'layout-primitives.js',
	'primitives/base.js',
	'primitives/form.js',
	'primitives/skeleton.js',
	'primitives/view.js',
	'living-path/profile.js',
	'living-path/path.js',
	'living-path/discovery.js',
	'living-path/filters.js',
	'living-path/filter-sheet.js'
];
const blueprints = blueprintNames
	.map(name => read(`geelooy/heichelos/heichel/modules/ui/blueprints/${name}`))
	.join('\n');
const cssEntry = read('geelooy/style/heichelos/heichel/index.css');
const shell = read('geelooy/style/heichelos/heichel/shell.css');
const cosmicEntry = read('geelooy/style/heichelos/heichel/cosmic-profile/index.css');
const mobileShell = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/shell.css');
const mobileProfile = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/shell-profile.css');

for (const token of [
	'heichel-mobile-topbar',
	'geelooy-heichel-hero',
	'hero-stats',
	'series-search-row',
	'geelooy-bottom-nav',
	'dynamic-grid'
]) {
	assert.ok(blueprints.includes(token), `blueprint graph missing ${token}`);
}
for (const token of [
	'./tokens.css',
	'./shell.css',
	'./hero.css',
	'./series-list.css',
	'./bottom-nav.css',
	'./mobile.css'
]) {
	assert.ok(cssEntry.includes(token), `css entry missing ${token}`);
}
assert.match(shell, /overflow-y:\s*auto/);
assert.match(shell, /min-height:\s*100dvh/);
const mobileImport = '@import "./mobile-series/index.css";';
const coherenceImport = '@import "./visual-coherence.css";';
const layoutImport = '@import "./visual-layout.css";';
const overlayImport = '@import "./overlay-layer.css?v=heichel-ui-006";';
assert.ok(cosmicEntry.includes(mobileImport), 'cosmic profile must include mobile geometry');
assert.ok(cosmicEntry.includes(coherenceImport), 'cosmic profile must include final local palette ownership');
assert.ok(cosmicEntry.includes(layoutImport), 'cosmic profile must include final local geometry ownership');
assert.ok(cosmicEntry.includes(overlayImport), 'cosmic profile must include overlay layer');
assert.ok(cosmicEntry.indexOf(mobileImport) < cosmicEntry.indexOf(layoutImport), 'final geometry must follow mobile-series defaults');
assert.ok(cosmicEntry.indexOf(layoutImport) < cosmicEntry.indexOf(overlayImport), 'overlays must follow final geometry');
assert.match(cosmicEntry, /@import "\.\/overlay-layer\.css\?v=heichel-ui-006";\s*$/, 'overlay layer must own final cascade');
assert.ok(mobileShell.includes('shell-profile.css'));
assert.match(mobileProfile, /\.heichel-profile-cover\s*\{[^}]*block-size:\s*4\.75rem/s);
assert.match(mobileProfile, /\.heichel-profile-action\s*\{[^}]*min-block-size:\s*44px/s);
console.log('B"H socialShellContract.test passed');
