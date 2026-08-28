// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file scrollContract.test.mjs
 * @description
 * The Awtsmoos keeps the Heichel river open while fixed navigation rests in the viewport instead of a transformed finite shell;
 * Awtsmoos.com proves durable source contracts here, leaving measured browser geometry to runtime tests where living pixels may tell.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * @description Reads one current repository source vessel for scroll-contract verification.
 * @param {string} filePath Repository-relative source path.
 * @returns {string} UTF-8 source text.
 */
function readSource(filePath) {
	return readFileSync(filePath, 'utf8');
}

const shell = readSource('geelooy/style/heichelos/heichel/shell.css');
const mobileLayout = readSource(
	'geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/shell-layout.css'
);
const bottomNavigation = readSource('geelooy/style/heichelos/heichel/bottom-nav.css');
const cosmicDock = readSource(
	'geelooy/style/heichelos/heichel/cosmic-profile/mobile-dock.css'
);
const routeMotion = readSource('geelooy/style/geelooy-app/pages/route-motion.css');
const stickyPath = readSource(
	'geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/living-path/sticky-path.css'
);
const continueCard = readSource(
	'geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/living-path/continue.css'
);

assert.match(
	shell,
	/\.heichel-os-document\s*\{[^}]*overflow-y:\s*auto/s,
	'document must allow vertical scrolling'
);
assert.match(
	shell,
	/\.heichel-mobile-navigation\s*\{[^}]*min-height:\s*100dvh[^}]*overflow-y:\s*auto/s,
	'mobile shell must use dynamic height and vertical scrolling'
);
assert.match(
	mobileLayout,
	/\.geelooy-main-stage\s*\{[^}]*overflow:\s*visible/s,
	'mobile stage must not trap vertical scrolling'
);
assert.match(
	bottomNavigation,
	/\.geelooy-bottom-nav\s*\{[^}]*position:\s*fixed/s,
	'Heichel bottom navigation must remain fixed'
);
assert.match(
	cosmicDock,
	/body\.heichel-os-document \.g-dock\s*\{[^}]*display:\s*none\s*!important/s,
	'global dock must yield to Heichel mobile navigation'
);
assert.match(
	cosmicDock,
	/\.heichel-os-document \.geelooy-bottom-nav\s*\{[^}]*transform:\s*none\s*!important/s,
	'Heichel dock must clear inherited centering transforms'
);
assert.match(
	routeMotion,
	/g-route-piece-arrival 460ms[^;]+ backwards;/,
	'route entrance must release its transform after arrival'
);
assert.doesNotMatch(routeMotion, /g-route-piece-arrival 460ms[^;]+ both;/);
assert.match(stickyPath, /\.living-path-sticky button\s*\{[^}]*min-block-size:\s*44px/s);
assert.match(continueCard, /\.continue-action\s*\{[^}]*min-block-size:\s*44px/s);
assert.doesNotMatch(shell, /height:\s*100vh/);

console.log('B"H scrollContract.test passed');
