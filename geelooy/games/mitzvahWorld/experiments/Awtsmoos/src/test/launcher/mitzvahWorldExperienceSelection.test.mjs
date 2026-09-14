//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file mitzvahWorldExperienceSelection.test.mjs
 * @description Proves the official local worlds, Sandbox coexistence, legacy aliases, and single-player normalization contract.
 * Generic and multiplayer runtime options remain free of local-world policy while old bookmarks resolve to current canonical IDs.
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

test('B"H launcher exposes every official local profile in stable order', () => {
	assert.deepEqual(
		localMitzvahWorldExperiences().map(world => world.id),
		['blank-meadow', 'sandbox-world', 'living-village', 'great-valley']
	);
	assert.equal(resolveMitzvahWorldRuntimeExperience('unknown').id, 'blank-meadow');
	assert.equal(resolveMitzvahWorldRuntimeExperience('simple-meadow').id, 'blank-meadow');
	assert.equal(resolveMitzvahWorldRuntimeExperience('local-reference-village').id, 'great-valley');
});

test('B"H single-player normalizes aliases while generic options remain profile-free', () => {
	const local = createSinglePlayerWorldRuntimeOptions({ worldId: 'local-reference-village' }, {});
	const generic = createDirectWorldRuntimeOptions({ worldId: 'main-village' }, {});
	assert.equal(local.worldId, 'great-valley');
	assert.equal(local.worldExperience.id, 'great-valley');
	assert.equal(local.worldExperience.canonicalPromotion, true);
	assert.equal(local.worldExperience.deepWorldStreaming, true);
	assert.equal(generic.worldId, undefined);
	assert.equal(generic.worldExperience, undefined);
});

test('B"H single-player route forwards the selected official world id', async () => {
	const handlers = createMitzvahWorldRouteHandlers({
		environment: {},
		hosts: {},
		modes: { singlePlayer: async (_hosts, options) => options },
		parameters: new URLSearchParams(),
		realtimeUrl: null,
		revealHosts() {}
	});
	const options = await handlers.openSinglePlayer({ worldId: 'blank-meadow' });
	assert.equal(options.worldId, 'blank-meadow');
});
