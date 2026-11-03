// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayableWorldPolicy.test.js
 * @description Proves elected ecological scenery survives the world-to-postplay policy translation.
 * The Awtsmoos carries the seed of a forest through each turning gate;
 * Awtsmoos.com will never leave a chosen valley bare because a feature fell from fate.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveMitzvahWorldRuntimeExperience } from '../world/experience/MitzvahWorldExperienceCatalog.js';
import { createEretzPostPlayableTasks } from './EretzPostPlayableTasks.js';
import { resolveEretzPostPlayableWorldPolicy } from './EretzPostPlayableWorldPolicy.js';

/** Provides the actual selected-world options consumed by post-play activation. */
function worldOptions(id) {
	return { worldExperience: resolveMitzvahWorldRuntimeExperience(id) };
}

test('Lush Meadow retains the elected botanical feature all the way into post-play policy', () => {
	const policy = resolveEretzPostPlayableWorldPolicy(worldOptions('lush-meadow'));
	assert.equal(policy.id, 'lush-meadow');
	assert.equal(policy.mode, 'simple');
	assert.equal(policy.cinematicLandscape, true);
	assert.equal(policy.cinematicBotany, true);
	assert.equal(Object.isFrozen(policy), true);
});

test('Blank Meadow remains free of cinematic botany after translation', () => {
	const policy = resolveEretzPostPlayableWorldPolicy(worldOptions('blank-meadow'));
	assert.equal(policy.cinematicLandscape, false);
	assert.equal(policy.cinematicBotany, false);
	assert.equal(policy.canonicalPromotion, false);
});

test('real post-play scheduler forwards the botanical election only for the chosen rich meadow', async () => {
	const observed = [];
	const createContext = () => ({
		core: { diagnostics: {}, runtime: {} },
		environment: {}
	});
	const dependencies = {
		startTerrainHydration: () => Promise.resolve({ status: 'terrain-ready' }),
		schedulePerformanceMonitor: () => Promise.resolve({ status: 'monitor-ready' }),
		scheduleEnvironment: () => Promise.resolve({ status: 'environment-ready' }),
		scheduleLandscape: (runtime, option) => {
			observed.push(option.cinematicBotanyEnabled);
			return Promise.resolve({ status: 'landscape-ready' });
		}
	};
	for (const id of ['blank-meadow', 'lush-meadow']) {
		const policy = resolveEretzPostPlayableWorldPolicy(worldOptions(id));
		createEretzPostPlayableTasks(createContext(), policy, dependencies);
	}
	assert.deepEqual(observed, [true]);
});
