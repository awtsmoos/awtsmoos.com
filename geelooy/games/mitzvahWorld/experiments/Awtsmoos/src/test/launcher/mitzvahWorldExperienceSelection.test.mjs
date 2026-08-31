//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldExperienceSelection.test.mjs
 * @description Proves local world identity resolves only inside the single-player boundary while generic runtime options remain safe for multiplayer.
 * The Awtsmoos gives each local world one truthful name without placing that garment on every shared soul;
 * Awtsmoos.com keeps Simple Meadow light, Mountain Village rich, and multiplayer free to preserve its separate role.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createDirectWorldRuntimeOptions } from '../../launcher/MitzvahWorldDirectRuntimeOptions.js';
import { createMitzvahWorldRouteHandlers } from '../../launcher/MitzvahWorldRouteHandlers.js';
import { createSinglePlayerWorldRuntimeOptions } from '../../launcher/MitzvahWorldSinglePlayerRuntimeOptions.js';
import {
	localMitzvahWorldExperiences,
	resolveMitzvahWorldRuntimeExperience
} from '../../world/experience/MitzvahWorldExperienceCatalog.js';

test('experience catalog exposes two distinct truthful local profiles', () => {
	const worlds = localMitzvahWorldExperiences();
	assert.deepEqual(worlds.map(world => world.id), ['simple-meadow', 'local-reference-village']);
	assert.equal(worlds[0].runtime.canonicalPromotion, false);
	assert.equal(worlds[1].runtime.canonicalPromotion, true);
	assert.equal(resolveMitzvahWorldRuntimeExperience('unknown').id, 'simple-meadow');
});

test('single-player options carry Mountain Village while generic options remain profile-free', () => {
	const local = createSinglePlayerWorldRuntimeOptions({ worldId: 'local-reference-village' }, {});
	const generic = createDirectWorldRuntimeOptions({ worldId: 'main-village' }, {});
	assert.equal(local.worldId, 'local-reference-village');
	assert.equal(local.worldExperience.id, 'local-reference-village');
	assert.equal(local.worldExperience.canonicalPromotion, true);
	assert.equal(local.worldExperience.districtStreaming, true);
	assert.equal(generic.worldId, undefined);
	assert.equal(generic.worldExperience, undefined);
});

test('single-player route forwards the selected local world id', async () => {
	const handlers = createMitzvahWorldRouteHandlers({
		environment: {},
		hosts: {},
		modes: { singlePlayer: async (_hosts, options) => options },
		parameters: new URLSearchParams(),
		realtimeUrl: null,
		revealHosts() {}
	});
	const options = await handlers.openSinglePlayer({ worldId: 'simple-meadow' });
	assert.equal(options.worldId, 'simple-meadow');
});
