//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file blankMeadowPostPlayableFeatures.test.mjs
 * @description Proves Blank Meadow permits only grass/dirt hydration and performance monitoring after control, while rich presentation stays closed.
 * The test counts actual side-effect launchers so a hidden regression cannot masquerade as a disabled manifest flag.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { startEretzPostPlayablePriority } from '../../app/EretzPostPlayablePriority.js';
import { resolveMitzvahWorldRuntimeExperience } from '../../world/experience/MitzvahWorldExperienceCatalog.js';

test('B"H Blank Meadow opens only reliability-baseline post-play tasks', async () => {
	const calls = {
		environment: 0,
		hero: 0,
		landscape: 0,
		launchers: 0,
		performance: 0,
		terrain: 0
	};
	const core = {
		diagnostics: {},
		foundation: {},
		runtime: { destroyed: false }
	};
	const context = {
		boot: {},
		core,
		environment: globalThis,
		options: { worldExperience: resolveMitzvahWorldRuntimeExperience('blank-meadow') }
	};
	const result = await startEretzPostPlayablePriority(context, {
		loadLaunchers: async () => { calls.launchers += 1; return {}; },
		scheduleEnvironment: () => { calls.environment += 1; },
		scheduleHeroPresentation: () => { calls.hero += 1; },
		scheduleLandscape: () => { calls.landscape += 1; },
		schedulePerformanceMonitor: () => { calls.performance += 1; return { status: 'ready' }; },
		startTerrainHydration: () => { calls.terrain += 1; return { status: 'ready' }; }
	});

	assert.deepEqual(calls, {
		environment: 0,
		hero: 0,
		landscape: 0,
		launchers: 0,
		performance: 1,
		terrain: 1
	});
	assert.equal(result.status, 'simple-world-ready');
	assert.equal(result.policy.id, 'blank-meadow');
	assert.equal((await result.terrainHydration).status, 'ready');
	assert.equal((await result.performanceMonitor).status, 'ready');
	assert.equal((await result.cinematicEnvironment).status, 'disabled-by-world-profile');
});
