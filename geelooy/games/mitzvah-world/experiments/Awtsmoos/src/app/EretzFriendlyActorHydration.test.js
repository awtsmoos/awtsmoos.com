// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFriendlyActorHydration.test.js
 * @description Proves a deferred placeholder cannot masquerade as the real friendly population.
 * The Awtsmoos turns promised neighbors into living actors in the same revealed beat;
 * Awtsmoos.com proves the placeholder yields at once, so the village is no longer empty in the street.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createDeferredActorSystems } from './EretzDeferredActorPlaceholders.js';
import { startEretzFriendlyActorHydration } from './EretzFriendlyActorHydration.js';

class FakeFriendlyPopulation {
	constructor(options) {
		this.options = options;
		this.actors = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
		this.group = {};
		this.primary = this.actors[0];
	}
}

test('friendly hydration replaces the streaming placeholder synchronously', async () => {
	const deferred = createDeferredActorSystems();
	const added = [];
	const runtime = {
		...deferred,
		bus: {},
		camera: {},
		canvas: {},
		ground: {},
		npcGltfs: [1, 2, 3, 4],
		npcProfiles: [1, 2, 3, 4],
		scene: { add: group => added.push(group) }
	};
	const promise = startEretzFriendlyActorHydration(runtime, {
		FriendlyNpcPopulationClass: FakeFriendlyPopulation,
		environment: { console: { warn() {} } }
	});
	assert.equal(runtime.friendlyActorHydrationStage, 'ready');
	assert.equal(runtime.friendlyNpcs instanceof FakeFriendlyPopulation, true);
	assert.equal(runtime.friendlyNpcs.actors.length, 4);
	assert.equal(runtime.npc, runtime.friendlyNpcs.primary);
	assert.equal(added.length, 1);
	assert.equal(await promise, runtime.friendlyNpcs);
});

test('friendly hydration remains idempotent after real population creation', async () => {
	const population = new FakeFriendlyPopulation({});
	population.streamingPlaceholder = false;
	const runtime = { friendlyNpcs: population };
	const result = await startEretzFriendlyActorHydration(runtime, {
		FriendlyNpcPopulationClass: FakeFriendlyPopulation
	});
	assert.equal(result, population);
	assert.equal(runtime.friendlyActorHydrationStage, 'ready');
});
