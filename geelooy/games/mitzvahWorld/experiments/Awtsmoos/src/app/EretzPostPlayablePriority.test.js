// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayablePriority.test.js
 * @description Proves world richness yields to the stable canonical-player launch promise without ever disappearing.
 * The Awtsmoos orders one revelation after another, yet no promised valley is denied;
 * Awtsmoos.com sees the unbroken Chossid promise first, then releases every world stream beside him with pride.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	startEretzPostPlayablePriority,
	waitForCanonicalPlayerWindow
} from './EretzPostPlayablePriority.js';

function createContext(runtime = {}) {
	return {
		boot: {},
		core: { diagnostics: {}, runtime },
		environment: {},
		options: {}
	};
}

test('world launchers wait until the canonical-player priority gate settles', async () => {
	let releasePriority;
	let launcherLoads = 0;
	let districtStarts = 0;
	let enrichmentStarts = 0;
	const priority = new Promise(resolve => { releasePriority = resolve; });
	const context = createContext({ destroyed: false });
	const launchPromise = startEretzPostPlayablePriority(context, {
		loadLaunchers: async () => {
			launcherLoads += 1;
			return {
				startDeferred: () => { enrichmentStarts += 1; return 'enrichment'; },
				startDistrict: () => { districtStarts += 1; return 'districts'; }
			};
		},
		waitForPlayer: () => priority
	});
	assert.equal(launcherLoads, 0);
	releasePriority({ reason: 'canonical-settled', waitedMs: 400 });
	const receipt = await launchPromise;
	assert.equal(launcherLoads, 1);
	assert.equal(districtStarts, 1);
	assert.equal(enrichmentStarts, 1);
	assert.equal(await receipt.districts, 'districts');
	assert.equal(await receipt.enrichment, 'enrichment');
	assert.equal(receipt.status, 'launched');
});

test('priority gate prefers stable launch promise when transient promise is absent', async () => {
	let releaseCanonical;
	let now = 100;
	const launchPromise = new Promise(resolve => { releaseCanonical = resolve; });
	const environment = {
		performance: { now: () => now },
		setTimeout() {}
	};
	const pending = waitForCanonicalPlayerWindow(
		{
			canonicalPlayerLaunchPromise: launchPromise,
			canonicalPlayerPromise: null
		},
		environment,
		{ playerPriorityMilliseconds: 5000 }
	);
	now = 340;
	releaseCanonical({ status: 'ready' });
	const result = await pending;
	assert.equal(result.reason, 'canonical-settled');
	assert.equal(result.waitedMs, 240);
});

test('missing canonical promise never delays canonical world launch', async () => {
	let launcherLoads = 0;
	const context = createContext({ destroyed: false });
	const receipt = await startEretzPostPlayablePriority(context, {
		loadLaunchers: async () => {
			launcherLoads += 1;
			return {
				startDeferred: () => null,
				startDistrict: () => null
			};
		}
	});
	assert.equal(launcherLoads, 1);
	assert.equal(receipt.priority.reason, 'no-canonical-promise');
	assert.equal(receipt.priority.waitedMs, 0);
	assert.equal(receipt.status, 'launched');
});
