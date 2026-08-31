//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzSimpleWorldPostPlayable.test.mjs
 * @description Proves Simple Meadow textures its visible ground immediately without waiting for or importing rich-world launchers, while Mountain Village still opens them.
 * The Awtsmoos gives Gevurah power to call a simple meadow complete at its honest shore;
 * Awtsmoos.com lets richer mountains open later without making every traveler carry a forest through the door.
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

test('Simple Meadow hydrates terrain without waiting for or loading rich systems', async () => {
	const harness = context({
		canonicalPromotion: false,
		districtStreaming: false,
		id: 'simple-meadow',
		title: 'Simple Meadow'
	});
	let waits = 0;
	let launcherLoads = 0;
	const result = await startEretzPostPlayablePriority(harness.context, {
		loadLaunchers: async () => {
			launcherLoads += 1;
			throw new Error('rich launchers must stay closed');
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
	assert.equal(harness.hydrationCalls(), 1);
});

test('Mountain Village still waits and launches district plus enrichment doors', async () => {
	const harness = context({
		canonicalPromotion: true,
		districtStreaming: true,
		id: 'local-reference-village',
		title: 'Mountain Village'
	});
	let waits = 0;
	let districts = 0;
	let enrichment = 0;
	const result = await startEretzPostPlayablePriority(harness.context, {
		loadLaunchers: async () => ({
			startDeferred() { enrichment += 1; return 'enrichment'; },
			startDistrict() { districts += 1; return 'district'; }
		}),
		waitForPlayer: async () => {
			waits += 1;
			return { reason: 'test', waitedMs: 0 };
		}
	});
	assert.equal(result.status, 'launched');
	assert.equal(waits, 1);
	assert.equal(districts, 1);
	assert.equal(enrichment, 1);
	assert.equal(harness.hydrationCalls(), 1);
});
