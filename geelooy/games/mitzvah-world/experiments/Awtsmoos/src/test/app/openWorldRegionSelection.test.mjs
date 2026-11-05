//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file openWorldRegionSelection.test.mjs
 * @description Proves one global world can keep distant physical packages dormant, preload the horizon, reveal approach, and resist border thrash.
 * The Awtsmoos holds every coordinate in one world while finite memory opens each vessel by need;
 * Awtsmoos.com tests concealment, preparation, revelation, and wider release without moving the traveler's deed.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { OPEN_WORLD_MANIFEST, openWorldManifestEvidence, openWorldPackage } from '../../app/OpenWorldManifest.js';
import { OPEN_WORLD_PACKAGE_STATES, selectOpenWorldPackages } from '../../app/OpenWorldRegionSelection.js';

test('manifest exposes one global world above separate physical packages', () => {
	assert.deepEqual(openWorldManifestEvidence(), {
		coordinateSpace: 'global-xz',
		packageCount: 2,
		regionCount: 13,
		worldId: 'reference-mountain-village-open-world-v1'
	});
	assert.equal(OPEN_WORLD_MANIFEST.corePackageId, 'lower-meadow');
	assert.deepEqual(openWorldPackage('kedem-highlands').regionIds, [
		'kedem-gate',
		'cedar-terraces',
		'letter-quarry',
		'warden-summit'
	]);
});

test('player travel drives dormant, preloaded, and active package states', () => {
	const village = selectOpenWorldPackages({ x: 0, z: 0 });
	assert.equal(village.get('lower-meadow'), OPEN_WORLD_PACKAGE_STATES.ACTIVE);
	assert.equal(village.get('kedem-highlands'), OPEN_WORLD_PACKAGE_STATES.DORMANT);
	const approach = selectOpenWorldPackages({ x: -40, z: 50 }, village);
	assert.equal(approach.get('kedem-highlands'), OPEN_WORLD_PACKAGE_STATES.PRELOADED);
	const highlands = selectOpenWorldPackages({ x: -112, z: 100 }, approach);
	assert.equal(highlands.get('kedem-highlands'), OPEN_WORLD_PACKAGE_STATES.ACTIVE);
});

test('release radius keeps a loaded package warm before eventual retirement', () => {
	const loaded = new Map([
		['lower-meadow', OPEN_WORLD_PACKAGE_STATES.ACTIVE],
		['kedem-highlands', OPEN_WORLD_PACKAGE_STATES.ACTIVE]
	]);
	const warm = selectOpenWorldPackages({ x: 0, z: 0 }, loaded);
	assert.equal(warm.get('kedem-highlands'), OPEN_WORLD_PACKAGE_STATES.PRELOADED);
	const retired = selectOpenWorldPackages({ x: 800, z: 800 }, warm);
	assert.equal(retired.get('kedem-highlands'), OPEN_WORLD_PACKAGE_STATES.DORMANT);
});
