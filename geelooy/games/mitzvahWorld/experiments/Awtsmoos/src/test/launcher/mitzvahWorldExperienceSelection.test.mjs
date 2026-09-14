//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file mitzvahWorldExperienceSelection.test.mjs
 * @description Proves local world identity and Sandbox creator policy stay explicit inside single-player routing.
 * The Awtsmoos gives each local world one truthful name while Awtsmoos.com keeps fast play, free creation,
 * rich village streaming, and multiplayer transport in their appointed boundaries without silent fallback.
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

test('experience catalog exposes play, sandbox, and rich local worlds', () => {
	const worlds = localMitzvahWorldExperiences();
	assert.deepEqual(worlds.map(world => world.id), [
		'simple-meadow',
		'sandbox-world',
		'local-reference-village'
	]);	assert.equal(worlds[0].runtime.canonicalPromotion, false);
	assert.equal(worlds[1].runtime.canonicalPromotion, false);
	assert.equal(worlds[1].runtime.sandboxCreator, true);
	assert.equal(worlds[1].runtime.deepWorldStreaming, false);
	assert.equal(worlds[2].runtime.canonicalPromotion, true);
	assert.equal(resolveMitzvahWorldRuntimeExperience('unknown').id, 'simple-meadow');
});

test('single-player options preserve Sandbox and Mountain Village policy', () => {
	const sandbox = createSinglePlayerWorldRuntimeOptions({ worldId: 'sandbox-world' }, {});
	const village = createSinglePlayerWorldRuntimeOptions({ worldId: 'local-reference-village' }, {});
	const generic = createDirectWorldRuntimeOptions({ worldId: 'main-village' }, {});
	assert.equal(sandbox.worldId, 'sandbox-world');
	assert.equal(sandbox.worldExperience.sandboxCreator, true);
	assert.equal(village.worldId, 'local-reference-village');
	assert.equal(village.worldExperience.canonicalPromotion, true);
	assert.equal(village.worldExperience.districtStreaming, true);
	assert.equal(generic.worldId, undefined);
	assert.equal(generic.worldExperience, undefined);
});

test('single-player route forwards the selected local world id', async () => {
	const handlers = createMitzvahWorldRouteHandlers({
		environment: {},
		hosts: {},
		modes: { singlePlayer: async (_hosts, options) => options },
		parameters: new URLSearchParams(),		realtimeUrl: null,
		revealHosts() {}
	});
	const options = await handlers.openSinglePlayer({ worldId: 'sandbox-world' });
	assert.equal(options.worldId, 'sandbox-world');
});
