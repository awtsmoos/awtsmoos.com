// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvah-worldExperienceCatalog.test.mjs
 * @description Proves canonical world isolation while a new opt-in lush meadow blooms after first control.
 * The Awtsmoos keeps the blank clearing quiet and wakens the chosen woods;
 * Awtsmoos.com never claims a forest where only bare meadow stood.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	DEFAULT_LOCAL_WORLD_ID,
	localMitzvahWorldExperiences,
	resolveMitzvahWorldExperience,
	resolveMitzvahWorldRuntimeExperience
} from '../../world/experience/MitzvahWorldExperienceCatalog.js';

test('official catalog preserves four established worlds and adds opt-in Lush Meadow', () => {
	const worlds = localMitzvahWorldExperiences();
	assert.equal(DEFAULT_LOCAL_WORLD_ID, 'blank-meadow');
	assert.deepEqual(worlds.map(world => world.id), [
		'blank-meadow', 'sandbox-world', 'living-village', 'great-valley', 'lush-meadow'
	]);
	assert.equal(worlds.every(Object.isFrozen), true);
	assert.equal(worlds.every(world => Object.isFrozen(world.runtime)), true);
});

test('Blank Meadow remains the fastest creator world without a rich forest mount', () => {
	const meadow = resolveMitzvahWorldRuntimeExperience('blank-meadow');
	for (const feature of [
		'bootstrapCombat', 'bootstrapMinimap', 'canonicalPromotion', 'cinematicBotany',
		'cinematicEnvironment', 'cinematicHero', 'cinematicLandscape',
		'deepWorldStreaming', 'districtStreaming'
	]) assert.equal(meadow[feature], false, feature);
	assert.equal(meadow.postPlayTerrainHydration, true);
	assert.equal(meadow.richRenderer, true);
});

test('Lush Meadow elects real post-play forest ecology without deep world streaming', () => {
	const world = resolveMitzvahWorldExperience('lush-meadow');
	const policy = resolveMitzvahWorldRuntimeExperience('lush-meadow');
	assert.equal(world.title, 'Lush Meadow');
	assert.equal(world.recommended, false);
	assert.equal(policy.cinematicBotany, true);
	assert.equal(policy.cinematicLandscape, true);
	assert.equal(policy.cinematicEnvironment, true);
	assert.equal(policy.canonicalPromotion, false);
	assert.equal(policy.deepWorldStreaming, false);
	assert.equal(policy.postPlayTerrainHydration, true);
});

test('established Village and Great Valley streaming policies stay independent', () => {
	const village = resolveMitzvahWorldRuntimeExperience('living-village');
	const valley = resolveMitzvahWorldRuntimeExperience('great-valley');
	for (const world of [village, valley]) {
		assert.equal(world.richRenderer, true);
		assert.equal(world.postPlayTerrainHydration, true);
		assert.equal(world.canonicalPromotion, true);
		assert.equal(world.districtStreaming, true);
		assert.equal(world.cinematicBotany, false);
	}
	assert.equal(village.deepWorldStreaming, false);
	assert.equal(valley.deepWorldStreaming, true);
	assert.equal(valley.cinematicLandscape, true);
	assert.equal(valley.cinematicHero, true);
});

test('unknown and legacy world ids retain their original fallback behavior', () => {
	assert.equal(resolveMitzvahWorldExperience('simple-meadow').id, 'blank-meadow');
	assert.equal(resolveMitzvahWorldExperience('local-reference-village').id, 'great-valley');
	assert.equal(resolveMitzvahWorldRuntimeExperience('missing-world').id, 'blank-meadow');
	assert.equal(resolveMitzvahWorldRuntimeExperience('').id, 'blank-meadow');
});
