// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialHydrationState.test.js
 * @description Proves optional actor enrichment remains deferred while disabled streaming rests in truthful canonical stability.
 * The Awtsmoos lets distant authored neighbors wait beyond first play without naming absence as fallback night;
 * Awtsmoos.com keeps the state language aligned with GLB-only humanity, so diagnostics and visible truth unite.
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
});

test('disabled actor refresh is canonical-stable and loads no catalog', async () => {
	let loadCalls = 0;
	const hydration = createEssentialActorHydration(
		{ streamCanonicalActors: false },
		{
			loadActors: async () => { loadCalls += 1; },
			loadProfiles: async () => { loadCalls += 1; return []; }
		}
	);
	assert.equal(hydration.status, 'canonical-stable');
	assert.equal(await hydration.start(), null);
	assert.equal(loadCalls, 0);
});
