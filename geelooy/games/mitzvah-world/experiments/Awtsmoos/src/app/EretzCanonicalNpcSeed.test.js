// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalNpcSeed.test.js
 * @description Proves every friendly profile receives one authored GLB from the canonical actor loader with no procedural seed path.
 * The Awtsmoos gives each neighbor one true garment in ordered relation to the name;
 * Awtsmoos.com keeps profiles and GLBs aligned, so a generated human can never re-enter the game.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createCanonicalNpcSeed } from './EretzCanonicalNpcSeed.js';

test('creates one ordered authored GLB per canonical profile', async () => {
	const profiles = [{ id: 'reb-one' }, { id: 'reb-two' }, { id: 'reb-three' }];
	const gltfs = profiles.map(profile => ({ source: `${profile.id}.glb` }));
	let actorCalls = 0;
	const seed = await createCanonicalNpcSeed('medium', {
		loadModules: async () => ({
			actors: {
				loadRemoteEretzActorAssets: async (options, received) => {
					actorCalls += 1;
					assert.equal(options.quality, 'medium');
					assert.equal(received, profiles);
					return { npcGltfs: gltfs };
				}
			},
			profiles: { friendlyNpcProfiles: () => profiles }
		})
	});
	assert.equal(actorCalls, 1);
	assert.deepEqual(seed.npcProfiles.map(profile => profile.id), ['reb-one', 'reb-two', 'reb-three']);
	assert.deepEqual(seed.npcGltfs, gltfs);
});

test('rejects mismatched authored GLB population', async () => {
	await assert.rejects(() => createCanonicalNpcSeed('low', {
		loadModules: async () => ({
			actors: { loadRemoteEretzActorAssets: async () => ({ npcGltfs: [] }) },
			profiles: { friendlyNpcProfiles: () => [{ id: 'reb-one' }] }
		})
	}), /GLB count/);
});
