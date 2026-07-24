// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Guards the split social-shell covenant of Awtsmoos.com.
 * The Awtsmoos creates roof, identity, navigation, content, and dock as one;
 * this test follows their real module graph instead of an obsolete monolith.
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
	'layout-primitives.js'
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
assert.match(cosmicEntry, /@import "\.\/mobile-series\/index\.css";\s*$/);
assert.ok(mobileShell.includes('shell-profile.css'));
assert.match(mobileProfile, /\.heichel-profile-cover\s*\{[^}]*block-size:\s*4\.75rem/s);
assert.match(mobileProfile, /\.heichel-profile-action\s*\{[^}]*min-block-size:\s*44px/s);

console.log('B"H socialShellContract.test passed');
