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
 * Awtsmoos.com proves manifests resolve, local ownership survives, and historical
 * escape hatches cannot quietly return beneath a newly polished reader border.
 */
const here = dirname(fileURLToPath(import.meta.url));
const postRoot = resolve(here, '..');
const rebornRoot = resolve(postRoot, 'styles/ideal/reborn');
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

/** Extracts relative stylesheet imports from one manifest source. */
function importsOf(ohrSource) {
	return [...ohrSource.matchAll(/@import url\(['"]([^'"]+)['"]\);/g)]
		.map((yesodMatch) => yesodMatch[1]);
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
		assert.ok(
			ohrChild.includes('.post-reader-localized-context'),
			`${netivChild} lost reader-local selector ownership`
		);
	}
}

for (const shemCompatibility of [
	'mobile-sidebar-reset.css',
	'sidebar-viewport-seal.css'
]) {
	const ohrSource = readFileSync(resolve(rebornRoot, shemCompatibility), 'utf8');
	const ohrWithoutComments = ohrSource.replace(/\/\*[\s\S]*?\*\//g, '').trim();
	assert.equal(ohrWithoutComments, '', `${shemCompatibility} must remain inert`);
}

const contextCss = readFileSync(resolve(rebornRoot, 'context-menu.css'), 'utf8');
assert.match(contextCss, /\.awtsmoos-reader-portal-surface/);
assert.doesNotMatch(contextCss, /^#(?:custom-context-menu|insane-verse-menu)/m);
assert.doesNotMatch(contextCss, forbidden);
assert.ok(contextCss.split('\n').length <= 120);

const fullscreenCss = readFileSync(resolve(rebornRoot, 'sidebar-fullscreen.css'), 'utf8');
assert.match(fullscreenCss, /var\(--z-modal\)/);
assert.match(fullscreenCss, /100dvi/);
assert.doesNotMatch(fullscreenCss, forbidden);
assert.ok(fullscreenCss.split('\n').length <= 120);

console.log('B"H ReaderSidebarCascade.test passed');
