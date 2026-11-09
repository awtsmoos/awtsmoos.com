//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file mitzvahWorldSandboxExperience.test.mjs
 * @description Proves Sandbox extends the latest official local-world ladder without replacing reliability, village, or valley profiles.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	localMitzvahWorldExperiences,
	resolveMitzvahWorldExperience,
	resolveMitzvahWorldRuntimeExperience
} from '../../world/experience/MitzvahWorldExperienceCatalog.js';

test('Sandbox augments the official world ladder without deleting upstream worlds', () => {
	const ids = localMitzvahWorldExperiences().map(world => world.id);
	assert.deepEqual(ids, [
		'blank-meadow',
		'sandbox-world',
		'living-village',
		'great-valley'
	]);
	assert.equal(resolveMitzvahWorldExperience('simple-meadow').id, 'blank-meadow');
	assert.equal(resolveMitzvahWorldExperience('local-reference-village').id, 'great-valley');
});

test('Sandbox is explicitly local-first and creator-enabled', () => {
	const runtime = resolveMitzvahWorldRuntimeExperience('sandbox-world');
	assert.equal(runtime.sandboxCreator, true);
	assert.equal(runtime.canonicalPromotion, false);
	assert.equal(runtime.deepWorldStreaming, false);
	assert.equal(runtime.districtStreaming, false);
	assert.equal(runtime.postPlayTerrainHydration, false);
	assert.equal(runtime.id, 'sandbox-world');
});
