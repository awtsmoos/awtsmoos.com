//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzPostPlayablePriority.test.js
 * @description Proves rich worlds start the stable canonical Chossid promise before waiting, while simple worlds never wake that branch.
 * The Awtsmoos orders promise before patience and simplicity before excess; Awtsmoos.com sees the true player doorway open first,
 * then lets rich valleys continue only after their measured gate while Blank Meadow remains free of an unnecessary burst.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	startEretzPostPlayablePriority,
	waitForCanonicalPlayerWindow
} from './EretzPostPlayablePriority.js';

function createContext(runtime = {}, options = {}) {
	return {
		boot: {},
		core: { diagnostics: {}, runtime },
		environment: {},
		options
	};
}

function richLaunchers(counters) {
	return {
		startDeferred: () => { counters.enrichment += 1; return 'enrichment'; },
		startDistrict: () => { counters.districts += 1; return 'districts'; }
	};
}

test('rich world starts canonical player before its priority wait', async () => {
	const order = [];
	const counters = { districts: 0, enrichment: 0 };
	const runtime = { destroyed: false };
	const receipt = await startEretzPostPlayablePriority(createContext(runtime), {
		startPlayer(target) {
			order.push('start-player');
			target.canonicalPlayerLaunchPromise = Promise.resolve({ status: 'ready' });
			return target.canonicalPlayerLaunchPromise;
		},
		waitForPlayer(target) {
			order.push('wait-player');
			assert.ok(target.canonicalPlayerLaunchPromise);
			return Promise.resolve({ reason: 'canonical-settled', waitedMs: 0 });
		},
		loadLaunchers: async () => {
			order.push('load-world');
			return richLaunchers(counters);
		}
	});
	assert.deepEqual(order, ['start-player', 'wait-player', 'load-world']);
	assert.equal(await receipt.districts, 'districts');
	assert.equal(await receipt.enrichment, 'enrichment');
	assert.equal(receipt.status, 'launched');
});

test('priority clock prefers the stable launch promise', async () => {
	let releaseCanonical;
	let now = 100;
	const launchPromise = new Promise(resolve => { releaseCanonical = resolve; });
	const environment = {
		performance: { now: () => now },
		setTimeout() {}
	};
	const pending = waitForCanonicalPlayerWindow(
		{ canonicalPlayerLaunchPromise: launchPromise, canonicalPlayerPromise: null },
		environment,
		{ playerPriorityMilliseconds: 5000 }
	);
	now = 340;
	releaseCanonical({ status: 'ready' });
	const result = await pending;
	assert.equal(result.reason, 'canonical-settled');
	assert.equal(result.waitedMs, 240);
});

test('simple world never starts canonical promotion or rich launchers', async () => {
	let playerStarts = 0;
	let launcherLoads = 0;
	const worldExperience = {
		canonicalPromotion: false,
		cinematicEnvironment: false,
		cinematicHero: false,
		cinematicLandscape: false,
		deepWorldStreaming: false,
		districtStreaming: false,
		id: 'blank-meadow',
		performanceMonitor: false,
		postPlayTerrainHydration: false,
		title: 'Blank Meadow'
	};
	const receipt = await startEretzPostPlayablePriority(
		createContext({ destroyed: false }, { worldExperience }),
		{
			startPlayer: () => { playerStarts += 1; },
			loadLaunchers: async () => { launcherLoads += 1; return richLaunchers({ districts: 0, enrichment: 0 }); }
		}
	);
	assert.equal(playerStarts, 0);
	assert.equal(launcherLoads, 0);
	assert.equal(receipt.priority.reason, 'world-profile-simple');
	assert.equal(receipt.status, 'simple-world-ready');
});
