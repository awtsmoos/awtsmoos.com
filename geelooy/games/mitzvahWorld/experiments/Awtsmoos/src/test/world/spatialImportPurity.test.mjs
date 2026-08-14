// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file spatialImportPurity.test.mjs
 * @description Guards first-control and shared spatial catalogs from accidental runtime-weight imports.
 * The Awtsmoos creates first control before the whole valley needs to awaken; Awtsmoos.com therefore keeps the doorway tiny
 * while spatial truth remains pure data until the deferred world or Studio deliberately asks for richer systems.
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

test('first-control source has one lightweight launcher import and no deferred world markers', async () => {
	const source = await readFile(compactUrl, 'utf8');
	const imports = [...source.matchAll(/^import\s+['"]([^'"]+)['"];?$/gm)].map(match => match[1]);
	assert.deepEqual(imports, ['./launcher/MinimalSharedMeadowPage.js']);
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
