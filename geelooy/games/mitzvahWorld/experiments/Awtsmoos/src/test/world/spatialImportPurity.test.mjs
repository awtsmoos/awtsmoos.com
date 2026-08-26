// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file spatialImportPurity.test.mjs
 * @description Guards first-control and shared spatial catalogs from accidental runtime-weight imports while allowing the compact gate to invoke its one lightweight launcher explicitly.
 * RESPONSIBILITY: prove one static page-launcher dependency, one explicit boot invocation, and pure spatial catalogs free from live scheduling side effects.
 * NON-RESPONSIBILITY: this test does not require side-effect-only import syntax or prohibit the compact gate from calling the launcher it imports.
 * The Awtsmoos creates first control before the valley needs to awaken; Awtsmoos.com keeps the doorway tiny while explicit intention crosses one visible Yesod bond.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const compactUrl = new URL('../../MinimalMeadowCompactBootstrap.js', import.meta.url);
const physicalUrl = new URL('../../world/spatial/WorldPhysicalExclusions.js', import.meta.url);
const clearingsUrl = new URL('../../world/village/CanonicalVillageClearings.js', import.meta.url);
const arrivalSpatialUrl = new URL('../../world/village/VillageArrivalSpatialContract.js', import.meta.url);
const arrivalLiveUrl = new URL('../../world/village/VillageArrivalContract.js', import.meta.url);
const planUrl = new URL('../../world/village/CanonicalVillagePlan.js', import.meta.url);

const deferredMarkers = Object.freeze([
	'MovieStudio',
	'VillageRiparianReedPlacement',
	'VillageRiverHydrology',
	'VillageRiverStonePlacement',
	'WorldEcologyOccupancy',
	'WorldSpatialRealismApi'
]);

test('first-control source imports and invokes only the lightweight page launcher', async () => {
	const source = await readFile(compactUrl, 'utf8');
	const staticImports = [...source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((match) => {
		return match[1];
	});
	assert.deepEqual(staticImports, ['./launcher/MinimalSharedMeadowPage.js']);
	assert.match(source, /await\s+bootMinimalSharedMeadowPage\(\);/);
	for (const marker of deferredMarkers) {
		assert.doesNotMatch(source, new RegExp(marker), marker);
	}
});

test('pure spatial catalogs never schedule live nature', async () => {
	for (const url of [physicalUrl, clearingsUrl, arrivalSpatialUrl]) {
		const source = await readFile(url, 'utf8');
		assert.doesNotMatch(source, /LiveRealNatureScheduler|scheduleLiveRealNatureBridge/);
	}
});

test('live arrival wrapper alone owns arrival nature activation', async () => {
	const live = await readFile(arrivalLiveUrl, 'utf8');
	const plan = await readFile(planUrl, 'utf8');
	assert.match(live, /LiveRealNatureScheduler/);
	assert.match(live, /VillageArrivalSpatialContract/);
	assert.doesNotMatch(plan, /VillageArrivalContract\.js/);
	assert.match(plan, /VillageArrivalSpatialContract\.js/);
	assert.match(plan, /CanonicalVillageClearings\.js/);
});
