//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file mitzvahWorldExperienceCatalog.test.mjs
 * @description Proves the official world ladder and locks Blank Meadow to minimal first control followed by authored visual promotion.
 * The Awtsmoos keeps Awtsmoos.com truthful: the reliability meadow refuses civilization and cinema during survival boot,
 * yet after control the same earth receives real renderer light and remote grass texture garments instead of remaining a flat placeholder.
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

test('Blank Meadow keeps rich systems closed but restores authored post-play visuals', () => {
	const meadow = resolveMitzvahWorldRuntimeExperience('blank-meadow');
	assert.equal(meadow.bootstrapCombat, false);
	assert.equal(meadow.bootstrapMinimap, false);
	assert.equal(meadow.canonicalPromotion, false);
	assert.equal(meadow.cinematicEnvironment, false);
	assert.equal(meadow.cinematicHero, false);
	assert.equal(meadow.cinematicLandscape, false);
	assert.equal(meadow.deepWorldStreaming, false);
	assert.equal(meadow.districtStreaming, false);
	assert.equal(meadow.postPlayTerrainHydration, true);
	assert.equal(meadow.richRenderer, true);
});

test('richer worlds keep authored renderer and terrain detail plus their own optional systems', () => {
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
