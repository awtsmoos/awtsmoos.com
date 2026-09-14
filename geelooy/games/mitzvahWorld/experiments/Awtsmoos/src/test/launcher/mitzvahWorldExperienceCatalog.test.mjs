//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file mitzvahWorldExperienceCatalog.test.mjs
 * @description Proves the official local-world ladder, immutable feature policies, Sandbox coexistence, and compatibility aliases.
 * The launcher may evolve its names without changing the meaning of old saved or linked world IDs.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	DEFAULT_LOCAL_WORLD_ID,
	localMitzvahWorldExperiences,
	resolveMitzvahWorldExperience,
	resolveMitzvahWorldRuntimeExperience
} from '../../world/experience/MitzvahWorldExperienceCatalog.js';

test('B"H official catalog exposes Blank Meadow, Sandbox, Living Village, and Great Valley', () => {
	const worlds = localMitzvahWorldExperiences();
	assert.equal(DEFAULT_LOCAL_WORLD_ID, 'blank-meadow');
	assert.deepEqual(
		worlds.map(world => world.id),
		['blank-meadow', 'sandbox-world', 'living-village', 'great-valley']
	);
	assert.equal(worlds.every(world => Object.isFrozen(world)), true);
	assert.equal(worlds.every(world => Object.isFrozen(world.runtime)), true);
});

test('B"H Blank Meadow closes every heavy first-control and enrichment gate', () => {
	const meadow = resolveMitzvahWorldRuntimeExperience('blank-meadow');
	assert.equal(meadow.bootstrapCombat, false);
	assert.equal(meadow.bootstrapMinimap, false);
	assert.equal(meadow.canonicalPromotion, false);
	assert.equal(meadow.cinematicEnvironment, false);
	assert.equal(meadow.cinematicHero, false);
	assert.equal(meadow.cinematicLandscape, false);
	assert.equal(meadow.deepWorldStreaming, false);
	assert.equal(meadow.districtStreaming, false);
	assert.equal(meadow.richRenderer, true);
});

test('B"H richer worlds progressively opt into civilization and regional streaming', () => {
	const village = resolveMitzvahWorldRuntimeExperience('living-village');
	const valley = resolveMitzvahWorldRuntimeExperience('great-valley');
	assert.equal(village.canonicalPromotion, true);
	assert.equal(village.districtStreaming, true);
	assert.equal(village.deepWorldStreaming, false);
	assert.equal(valley.canonicalPromotion, true);
	assert.equal(valley.districtStreaming, true);
	assert.equal(valley.deepWorldStreaming, true);
	assert.equal(valley.cinematicLandscape, true);
	assert.equal(valley.cinematicHero, true);
});

test('B"H legacy world IDs resolve forward without becoming separate launcher cards', () => {
	assert.equal(resolveMitzvahWorldExperience('simple-meadow').id, 'blank-meadow');
	assert.equal(resolveMitzvahWorldExperience('local-reference-village').id, 'great-valley');
	assert.equal(resolveMitzvahWorldRuntimeExperience('missing-world').id, 'blank-meadow');
	assert.equal(resolveMitzvahWorldRuntimeExperience('').id, 'blank-meadow');
});
