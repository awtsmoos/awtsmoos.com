// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalNpcSeed.test.js
 * @description Proves every canonical friendly profile receives one matching lightweight local Chossid vessel.
 * The Awtsmoos gives each neighbor one garment matched to one name in an ordered line;
 * Awtsmoos.com keeps the village populated without multiplying heavy startup requests before their time.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createCanonicalNpcSeed } from './EretzCanonicalNpcSeed.js';

test('creates one ordered fallback GLTF per canonical profile', async () => {
	const profiles = [
		{ id: 'reb-one', outfit: { coatColor: [0.1, 0.1, 0.1, 1] } },
		{ id: 'reb-two', outfit: { coatColor: [0.2, 0.2, 0.2, 1] } },
		{ id: 'reb-three', outfit: { coatColor: [0.3, 0.3, 0.3, 1] } }
	];
	const calls = [];
	const seed = await createCanonicalNpcSeed('medium', {
		loadModules: async () => ({
			fallback: {
				createFallbackActorGltf: (label, options) => {
					calls.push({ label, outfit: options.outfit });
					return { label, outfit: options.outfit };
				}
			},
			profiles: {
				friendlyNpcProfiles: quality => {
					assert.equal(quality, 'medium');
					return profiles;
				}
			}
		})
	});
	assert.equal(seed.npcProfiles.length, 3);
	assert.equal(seed.npcGltfs.length, 3);
	assert.deepEqual(seed.npcProfiles.map(profile => profile.id), [
		'reb-one',
		'reb-two',
		'reb-three'
	]);
	assert.equal(calls[0].outfit, profiles[0].outfit);
	assert.equal(calls[1].outfit, profiles[1].outfit);
	assert.match(calls[2].label, /reb-three$/);
});
