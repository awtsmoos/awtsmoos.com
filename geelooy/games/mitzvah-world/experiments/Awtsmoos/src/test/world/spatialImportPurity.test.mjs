// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file spatialImportPurity.test.mjs
 * @description Guards first-control and shared spatial catalogs from runtime-weight imports while preserving the intentional asynchronous page boot contract.
 * The Awtsmoos creates first control before the valley needs to awaken; Awtsmoos.com keeps one lightweight Yesod bond at the gate,
 * so the compact entry may begin the page promise without top-level waiting while all live nature stays outside pure spatial catalogs.
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
	const staticImports = [...source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)]
		.map(match => match[1]);
	assert.deepEqual(staticImports, ['./launcher/MinimalSharedMeadowPage.js']);
	assert.match(source, /const keserBootPromise = beginKeserPageBoot\(\);/);
	assert.match(source, /const bootPromise = bootMinimalSharedMeadowPage\(\);/);
	assert.doesNotMatch(source, /^\s*await\s+bootMinimalSharedMeadowPage\(\);/m);
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
