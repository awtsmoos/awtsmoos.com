//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file mitzvahWorldExperienceCatalog.test.mjs
 * @description Proves the official world ladder and locks Blank Meadow to its measured survival contract.
 * The Awtsmoos keeps Awtsmoos.com truthful: the reliability meadow receives only the bootstrap vessel,
 * while village and valley worlds may still clothe themselves in richer post-play rendering and terrain detail.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	DEFAULT_LOCAL_WORLD_ID,
	localMitzvahWorldExperiences,
	resolveMitzvahWorldExperience,
	resolveMitzvahWorldRuntimeExperience
} from '../../world/experience/MitzvahWorldExperienceCatalog.js';

test('official catalog exposes the four canonical local worlds', () => {
	const worlds = localMitzvahWorldExperiences();
	assert.equal(DEFAULT_LOCAL_WORLD_ID, 'blank-meadow');
	assert.deepEqual(
		worlds.map(world => world.id),
		['blank-meadow', 'sandbox-world', 'living-village', 'great-valley']
	);
	assert.equal(worlds.every(world => Object.isFrozen(world)), true);
	assert.equal(worlds.every(world => Object.isFrozen(world.runtime)), true);
});

test('Blank Meadow disables every rich survival-profile enrichment gate', () => {
	const meadow = resolveMitzvahWorldRuntimeExperience('blank-meadow');
	assert.equal(meadow.bootstrapCombat, false);
	assert.equal(meadow.bootstrapMinimap, false);
	assert.equal(meadow.canonicalPromotion, false);
	assert.equal(meadow.cinematicEnvironment, false);
	assert.equal(meadow.cinematicHero, false);
	assert.equal(meadow.cinematicLandscape, false);
	assert.equal(meadow.deepWorldStreaming, false);
	assert.equal(meadow.districtStreaming, false);
	assert.equal(meadow.postPlayTerrainHydration, false);
	assert.equal(meadow.richRenderer, false);
});

test('richer worlds keep rich renderer and authored post-play terrain detail', () => {
	const village = resolveMitzvahWorldRuntimeExperience('living-village');
	const valley = resolveMitzvahWorldRuntimeExperience('great-valley');
	for (const world of [village, valley]) {
		assert.equal(world.richRenderer, true);
		assert.equal(world.postPlayTerrainHydration, true);
		assert.equal(world.canonicalPromotion, true);
		assert.equal(world.districtStreaming, true);
	}
	assert.equal(village.deepWorldStreaming, false);
	assert.equal(valley.deepWorldStreaming, true);
	assert.equal(valley.cinematicLandscape, true);
	assert.equal(valley.cinematicHero, true);
});

test('legacy world IDs resolve forward without becoming launcher cards', () => {
	assert.equal(resolveMitzvahWorldExperience('simple-meadow').id, 'blank-meadow');
	assert.equal(resolveMitzvahWorldExperience('local-reference-village').id, 'great-valley');
	assert.equal(resolveMitzvahWorldRuntimeExperience('missing-world').id, 'blank-meadow');
	assert.equal(resolveMitzvahWorldRuntimeExperience('').id, 'blank-meadow');
});
