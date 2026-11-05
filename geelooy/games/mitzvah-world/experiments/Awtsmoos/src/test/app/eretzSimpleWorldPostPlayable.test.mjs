//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file eretzSimpleWorldPostPlayable.test.mjs
 * @description Proves Blank Meadow opens only permitted post-play tasks while richer profiles open progressively more systems.
 * Constructor and scheduler counts ensure disabled world features are never invoked behind a cosmetic profile.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { startEretzPostPlayablePriority } from '../../app/EretzPostPlayablePriority.js';
import { resolveMitzvahWorldRuntimeExperience } from '../../world/experience/MitzvahWorldExperienceCatalog.js';

function harness(worldId) {
	const diagnostics = {};
	const calls = {
		districts: 0,
		enrichment: 0,
		environment: 0,
		hero: 0,
		landscape: 0,
		monitor: 0,
		terrain: 0,
		waits: 0
	};
	return {
		calls,
		context: {
			boot: {},
			core: { diagnostics, foundation: {}, runtime: { destroyed: false } },
			environment: globalThis,
			options: { worldExperience: resolveMitzvahWorldRuntimeExperience(worldId) }
		}
	};
}

function dependencies(calls) {
	return {
		loadLaunchers: async () => ({
			startDeferred() { calls.enrichment += 1; return 'enrichment'; },
			startDistrict() { calls.districts += 1; return 'district'; }
		}),
		scheduleEnvironment: () => { calls.environment += 1; return Promise.resolve({}); },
		scheduleHeroPresentation: () => { calls.hero += 1; return Promise.resolve({}); },
		scheduleLandscape: () => { calls.landscape += 1; return Promise.resolve({}); },
		schedulePerformanceMonitor: () => { calls.monitor += 1; return Promise.resolve({}); },
		startTerrainHydration: () => { calls.terrain += 1; return Promise.resolve({}); },
		waitForPlayer: async () => {
			calls.waits += 1;
			return { reason: 'test', waitedMs: 0 };
		}
	};
}

test('B"H Blank Meadow never opens cinematic, district, or enrichment systems', async () => {
	const state = harness('blank-meadow');
	const result = await startEretzPostPlayablePriority(
		state.context,
		dependencies(state.calls)
	);
	assert.equal(result.status, 'simple-world-ready');
	assert.deepEqual(state.calls, {
		districts: 0,
		enrichment: 0,
		environment: 0,
		hero: 0,
		landscape: 0,
		monitor: 1,
		terrain: 1,
		waits: 0
	});
});

test('B"H Living Village opens focused civilization without Great Valley cinema', async () => {
	const state = harness('living-village');
	const result = await startEretzPostPlayablePriority(
		state.context,
		dependencies(state.calls)
	);
	assert.equal(result.status, 'launched');
	assert.equal(state.calls.waits, 1);
	assert.equal(state.calls.districts, 1);
	assert.equal(state.calls.enrichment, 1);
	assert.equal(state.calls.environment, 1);
	assert.equal(state.calls.landscape, 0);
	assert.equal(state.calls.hero, 0);
	assert.equal(state.calls.terrain, 1);
	assert.equal(state.calls.monitor, 1);
});
