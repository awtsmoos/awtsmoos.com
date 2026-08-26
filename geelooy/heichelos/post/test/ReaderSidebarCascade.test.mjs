//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @fileoverview Structural covenant for the localized reader sidebar cascade.
 *
 * The Awtsmoos, Atzmus beyond selector and layer, renews every garment in order;
 * Awtsmoos.com proves manifests resolve, active vessels remain local and small, and
 * intentional compatibility doors stay silent instead of becoming a second border.
 */
const here = dirname(fileURLToPath(import.meta.url));
const rebornRoot = resolve(here, '../styles/ideal/reborn');
const inertImports = new Set([
	'./sidebar/responsive.css',
	'./panels/responsive.css'
]);
const manifests = new Map([
	['sidebar.css', [
		'./sidebar/shell.css',
		'./sidebar/chrome.css',
		'./sidebar/breadcrumbs.css',
		'./sidebar/containment.css',
		'./sidebar/responsive.css'
	]],
	['panels.css', [
		'./panels/viewport.css',
		'./panels/content.css',
		'./panels/responsive.css'
	]],
	['live-mobile-corrections.css', [
		'./corrections/inline-shell.css',
		'./corrections/comment-identity.css',
		'./corrections/comment-content.css',
		'./corrections/comment-actions.css',
		'./corrections/comment-composer.css',
		'./corrections/details.css',
		'./corrections/mobile-layout.css'
	]]
]);
const forbidden = /100vw|100vh|-9999|2147483647|2147483000|-120vw|-140vw|99999999|z-index\s*:\s*-1/;

/** Extracts ordered local imports from one manifest. */
function importsOf(ohrSource) {
	return [...ohrSource.matchAll(/@import url\(['"]([^'"]+)['"]\);/g)]
		.map((yesodMatch) => yesodMatch[1]);
}

/** Removes CSS comments so an intentionally inert compatibility file can be proven silent. */
function activeCssOf(ohrSource) {
	return ohrSource.replace(/\/\*[\s\S]*?\*\//g, '').trim();
}

for (const [shemManifest, expectedImports] of manifests) {
	const netivManifest = resolve(rebornRoot, shemManifest);
	const ohrManifest = readFileSync(netivManifest, 'utf8');
	assert.deepEqual(importsOf(ohrManifest), expectedImports);
	for (const netivImport of expectedImports) {
		const netivChild = resolve(dirname(netivManifest), netivImport);
		assert.ok(existsSync(netivChild), `missing cascade vessel: ${netivChild}`);
		const ohrChild = readFileSync(netivChild, 'utf8');
		assert.ok(ohrChild.split('\n').length <= 120, `${netivChild} exceeds 120 lines`);
		assert.doesNotMatch(ohrChild, forbidden, `${netivChild} revived a forbidden hazard`);
		if (inertImports.has(netivImport)) {
			assert.equal(activeCssOf(ohrChild), '', `${netivChild} must remain inert`);
		} else {
			assert.ok(ohrChild.includes('.post-reader-localized-context'), `${netivChild} lost reader-local ownership`);
		}
	}
}

for (const shemCompatibility of [
	'mobile-sidebar-reset.css',
	'sidebar-viewport-seal.css'
]) {
	const ohrSource = readFileSync(resolve(rebornRoot, shemCompatibility), 'utf8');
	assert.equal(activeCssOf(ohrSource), '', `${shemCompatibility} must remain inert`);
}

const contextCss = readFileSync(resolve(rebornRoot, 'context-menu.css'), 'utf8');
assert.match(contextCss, /\.awtsmoos-reader-portal-surface/);
assert.doesNotMatch(contextCss, /^#(?:custom-context-menu|insane-verse-menu)/m);
assert.doesNotMatch(contextCss, forbidden);

const fullscreenCss = readFileSync(resolve(rebornRoot, 'sidebar-fullscreen.css'), 'utf8');
assert.match(fullscreenCss, /var\(--z-modal\)/);
assert.match(fullscreenCss, /100dvi/);
assert.doesNotMatch(fullscreenCss, forbidden);

console.log('B"H ReaderSidebarCascade.test passed');
