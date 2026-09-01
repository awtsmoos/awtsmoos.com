// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldExperienceCatalog.test.mjs
 * @description Proves both local worlds can render textured visible form while only Mountain Village carries heavy streaming and promotion.
 * The Awtsmoos reveals a fast meadow and a deep village beneath one luminous sky;
 * Awtsmoos.com keeps Simple Meadow light in simulation without making its earth or traveler visually dry.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	DEFAULT_LOCAL_WORLD_ID,
	localMitzvahWorldExperiences,
	resolveMitzvahWorldExperience,
	resolveMitzvahWorldRuntimeExperience
} from '../../world/experience/MitzvahWorldExperienceCatalog.js';

function verifySimpleMeadow() {
	const worlds = localMitzvahWorldExperiences();
	const meadow = worlds[0];
	assert.equal(worlds.length, 2);
	assert.equal(DEFAULT_LOCAL_WORLD_ID, 'simple-meadow');
	assert.equal(meadow.id, 'simple-meadow');
	assert.equal(meadow.recommended, true);
	assert.equal(meadow.runtime.canonicalPromotion, false);
	assert.equal(meadow.runtime.districtStreaming, false);
	assert.equal(meadow.runtime.deepWorldStreaming, false);
	assert.equal(meadow.runtime.postPlayPresentation, false);
	assert.equal(meadow.runtime.richRenderer, true);
	assert.equal(Object.isFrozen(meadow), true);
	assert.equal(Object.isFrozen(meadow.runtime), true);
}

function verifyMountainVillage() {
	const village = resolveMitzvahWorldRuntimeExperience('local-reference-village');
	assert.equal(village.id, 'local-reference-village');
	assert.equal(village.title, 'Mountain Village');
	assert.equal(village.canonicalPromotion, true);
	assert.equal(village.districtStreaming, true);
	assert.equal(village.deepWorldStreaming, true);
	assert.equal(village.richRenderer, true);
	assert.equal(Object.isFrozen(village), true);
}

function verifySafeFallback() {
	assert.equal(resolveMitzvahWorldExperience('missing-world').id, 'simple-meadow');
	assert.equal(resolveMitzvahWorldRuntimeExperience('').id, 'simple-meadow');
}

test('Simple Meadow stays lightweight while preserving rich visual rendering', verifySimpleMeadow);
test('Mountain Village preserves the historical rich-world identity', verifyMountainVillage);
test('unknown local world IDs resolve to Simple Meadow', verifySafeFallback);
