// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzSimpleWorldPostPlayable.test.mjs
 * @description Proves Simple Meadow starts visual-only landscape plus hero/HUD after play without waiting for canonical promotion or opening rich-world launchers.
 * The Awtsmoos lets a simple world become beautiful without becoming another world;
 * Awtsmoos.com opens ridge, water, authored traveler, and interface while districts, ecology, quests, and rich launchers remain sealed.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { startEretzPostPlayablePriority } from '../../app/EretzPostPlayablePriority.js';

function context(worldExperience) {
	let hydrationCalls = 0;
	const diagnostics = {};
	return {
		context: {
			boot: {},
			core: {
				diagnostics,
				foundation: { terrain: { startTextureHydration() {
					hydrationCalls += 1;
					return { status: 'ready' };
				} } },
				runtime: { destroyed: false }
			},
			environment: globalThis,
			options: { worldExperience }
		},
		diagnostics,
		hydrationCalls: () => hydrationCalls
	};
}

test('B"H Simple Meadow schedules visual enrichment without rich-world launchers', async () => {
	const harness = context({
		canonicalPromotion: false,
		districtStreaming: false,
		id: 'simple-meadow',
		title: 'Simple Meadow'
	});
	let waits = 0;
	let launcherLoads = 0;
	let landscapes = 0;
	let heroes = 0;
	const result = await startEretzPostPlayablePriority(harness.context, {
		loadLaunchers: async () => {
			launcherLoads += 1;
			throw new Error('rich launchers must stay closed');
		},
		scheduleHeroPresentation: () => {
			heroes += 1;
			return Promise.resolve({ status: 'ready' });
		},
		scheduleLandscape: () => {
			landscapes += 1;
			return Promise.resolve({ status: 'ready' });
		},
		waitForPlayer: async () => {
			waits += 1;
			return { reason: 'test', waitedMs: 1 };
		}
	});
	await result.terrainHydration;
	assert.equal(result.status, 'simple-world-ready');
	assert.equal(result.priority.waitedMs, 0);
	assert.equal(waits, 0);
	assert.equal(launcherLoads, 0);
	assert.equal(landscapes, 1);
	assert.equal(heroes, 1);
	assert.equal(harness.hydrationCalls(), 1);
});

test('B"H Mountain Village still waits and opens district plus enrichment', async () => {
	const harness = context({
		canonicalPromotion: true,
		districtStreaming: true,
		id: 'local-reference-village',
		title: 'Mountain Village'
	});
	let waits = 0;
	let districts = 0;
	let enrichment = 0;
	let simpleVisuals = 0;
	const result = await startEretzPostPlayablePriority(harness.context, {
		loadLaunchers: async () => ({
			startDeferred() { enrichment += 1; return 'enrichment'; },
			startDistrict() { districts += 1; return 'district'; }
		}),
		scheduleHeroPresentation: () => { simpleVisuals += 1; },
		scheduleLandscape: () => { simpleVisuals += 1; },
		waitForPlayer: async () => {
			waits += 1;
			return { reason: 'test', waitedMs: 0 };
		}
	});
	assert.equal(result.status, 'launched');
	assert.equal(waits, 1);
	assert.equal(districts, 1);
	assert.equal(enrichment, 1);
	assert.equal(simpleVisuals, 0);
	assert.equal(harness.hydrationCalls(), 1);
});
