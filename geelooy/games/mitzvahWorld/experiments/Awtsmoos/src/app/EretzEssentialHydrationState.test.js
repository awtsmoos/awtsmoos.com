// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialHydrationState.test.js
 * @description Proves deferred actor hydration restores canonical profiles after play instead of forwarding an empty village.
 * The Awtsmoos preserves every neighbor beyond the first-control gate and returns each name when streaming may begin;
 * Awtsmoos.com keeps startup light without sacrificing the people whose later authored garments must enter the scene.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createEssentialActorHydration } from './EretzEssentialHydrationState.js';

test('deferred actor hydration forwards recovered canonical profiles', async () => {
	const profiles = Object.freeze([
		Object.freeze({ id: 'reb-one' }),
		Object.freeze({ id: 'reb-two' })
	]);
	let receivedProfiles = null;
	const hydration = createEssentialActorHydration(
		{ streamCanonicalActors: true },
		{
			loadActors: async (options, liveProfiles) => {
				assert.equal(options.streamCanonicalActors, true);
				receivedProfiles = liveProfiles;
				return { actors: liveProfiles.length };
			},
			loadProfiles: async () => profiles
		}
	);
	assert.equal(hydration.status, 'waiting-for-playable');
	const result = await hydration.start();
	assert.equal(receivedProfiles, profiles);
	assert.equal(result.actors, 2);
	assert.equal(hydration.status, 'ready');
	assert.equal(hydration.value, result);
});

test('disabled canonical actor stream never loads profile catalogs', async () => {
	let loadCalls = 0;
	const hydration = createEssentialActorHydration(
		{ streamCanonicalActors: false },
		{
			loadActors: async () => { loadCalls += 1; },
			loadProfiles: async () => { loadCalls += 1; return []; }
		}
	);
	assert.equal(hydration.status, 'fallback-stable');
	assert.equal(await hydration.start(), null);
	assert.equal(loadCalls, 0);
});
