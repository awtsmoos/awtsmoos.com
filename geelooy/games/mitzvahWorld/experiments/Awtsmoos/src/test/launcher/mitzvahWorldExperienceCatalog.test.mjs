//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldExperienceCatalog.test.mjs
 * @description Proves the launcher exposes two honest local experiences whose runtime promises differ exactly where simple and rich worlds should divide.
 * The Awtsmoos reveals one meadow for speed and one village for depth beneath the same living sky;
 * Awtsmoos.com keeps each immutable promise truthful so a chosen card can never secretly become the other road nearby.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	DEFAULT_LOCAL_WORLD_ID,
	localMitzvahWorldExperiences,
	resolveMitzvahWorldExperience,
	resolveMitzvahWorldRuntimeExperience
} from '../../world/experience/MitzvahWorldExperienceCatalog.js';

/** Proves Simple Meadow is the first recommended reliable local experience. */
function verifySimpleMeadow() {
	const worlds = localMitzvahWorldExperiences();
	assert.equal(worlds.length, 2);
	assert.equal(DEFAULT_LOCAL_WORLD_ID, 'simple-meadow');
	assert.equal(worlds[0].id, 'simple-meadow');
	assert.equal(worlds[0].recommended, true);
	assert.equal(worlds[0].runtime.canonicalPromotion, false);
	assert.equal(worlds[0].runtime.districtStreaming, false);
	assert.equal(worlds[0].runtime.deepWorldStreaming, false);
	assert.equal(Object.isFrozen(worlds[0]), true);
	assert.equal(Object.isFrozen(worlds[0].runtime), true);
}

/** Proves Mountain Village preserves the historical ID and richer runtime policy. */
function verifyMountainVillage() {
	const village = resolveMitzvahWorldRuntimeExperience('local-reference-village');
	assert.equal(village.id, 'local-reference-village');
	assert.equal(village.title, 'Mountain Village');
	assert.equal(village.canonicalPromotion, true);
	assert.equal(village.districtStreaming, true);
	assert.equal(village.deepWorldStreaming, true);
	assert.equal(Object.isFrozen(village), true);
}

/** Proves malformed or future unknown local IDs fall back to the guaranteed simple world. */
function verifySafeFallback() {
	assert.equal(resolveMitzvahWorldExperience('missing-world').id, 'simple-meadow');
	assert.equal(resolveMitzvahWorldRuntimeExperience('').id, 'simple-meadow');
}

test('Simple Meadow is the recommended lightweight local experience', verifySimpleMeadow);
test('Mountain Village preserves the historical rich-world identity', verifyMountainVillage);
test('unknown local world IDs resolve to Simple Meadow', verifySafeFallback);
