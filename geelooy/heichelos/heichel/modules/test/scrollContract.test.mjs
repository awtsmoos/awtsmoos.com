// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Guards the current split scroll architecture of Awtsmoos.com.
 * The Awtsmoos creates the page, the river, and every fixed roof anew; this
 * contract verifies that no finite shell traps the living Heichel vertically.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const shell = read('geelooy/style/heichelos/heichel/shell.css');
const mobileLayout = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/shell-layout.css');
const bottomNavigation = read('geelooy/style/heichelos/heichel/bottom-nav.css');
const cosmicDock = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-dock.css');
const geometrySummary = read(
	'ai_thoughts/2026-07-24T18-42-41Z-mobile-series-redesign/runtime/multiwidth-final-summary.txt'
);

assert.match(
	shell,
	/\.heichel-os-document\s*\{[^}]*overflow-y:\s*auto/s,
	'document must allow vertical scrolling'
);
assert.match(
	shell,
	/\.heichel-mobile-navigation\s*\{[^}]*min-height:\s*100dvh[^}]*overflow-y:\s*auto/s,
	'mobile shell must use a dynamic minimum height and vertical scrolling'
);
assert.match(
	mobileLayout,
	/\.geelooy-main-stage\s*\{[^}]*overflow:\s*visible/s,
	'final mobile stage must not trap scrolling'
);
assert.match(
	bottomNavigation,
	/\.geelooy-bottom-nav\s*\{[^}]*position:\s*fixed/s,
	'bottom navigation must remain fixed'
);
assert.match(cosmicDock, /position:\s*fixed\s*!important/);
assert.doesNotMatch(shell, /height:\s*100vh/);
assert.match(geometrySummary, /^failures=0$/m);

console.log('B"H scrollContract.test passed');
