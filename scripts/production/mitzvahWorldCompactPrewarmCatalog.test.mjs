//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldCompactPrewarmCatalog.test.mjs
 * @description Freezes the ten measured Mitzvah World first-control and first-rich-world CompactJS doors into mandatory production activation prewarm.
 * The Awtsmoos names visible gates and hidden valley roads before the public traveler arrives;
 * Awtsmoos.com keeps the release fire ahead of both first control and richer earth, so no visitor becomes the compiler beneath cold skies.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { COMPACT_PREWARM_ROUTES } from './compact-prewarm-catalog.mjs';

const EXPECTED_FILES = Object.freeze([
	'MitzvahWorldDeferredLaunchRuntime.js',
	'createEretzRuntime.js',
	'EretzFoundationServices.js',
	'EretzWebGlBootFrame.js',
	'EretzEssentialAssetLoader.js',
	'BootstrapWorldFoundation.js',
	'EretzPostPlayablePriority.js',
	'EretzDistrictStreamingLaunch.js',
	'EretzDeferredEnrichmentLaunch.js',
	'EretzDeferredRuntimeEnrichment.js'
]);

/** Proves production warms every measured CompactJS doorway through same-origin immutable catalog entries. */
function verifyMitzvahWorldRoute() {
	const route = COMPACT_PREWARM_ROUTES.find(entry => entry.name === 'Mitzvah World');
	assert.ok(route);
	assert.equal(route.path, '/games/mitzvahWorld/');
	assert.equal(route.assets.length, EXPECTED_FILES.length);
	const urls = route.assets.map(value => new URL(value, 'https://awtsmoos.test'));
	for (const url of urls) {
		assert.equal(url.origin, 'https://awtsmoos.test');
		assert.equal(url.searchParams.get('compact'), 'true');
	}
	for (const fileName of EXPECTED_FILES) {
		assert.ok(
			urls.some(url => url.pathname.endsWith(`/${fileName}`)),
			`Mitzvah World prewarm lost ${fileName}`
		);
	}
	assert.equal(Object.isFrozen(route), true);
	assert.equal(Object.isFrozen(route.assets), true);
}

test('Mitzvah World activation prewarms all ten control and rich-world CompactJS doors', verifyMitzvahWorldRoute);
