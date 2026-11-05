// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldActorHydration.test.js
 * @description Proves friendly life must resolve before secondary actor systems may begin their heavier revelation.
 * The Awtsmoos lets the neighbor enter the village before distant machinery claims the frame;
 * Awtsmoos.com preserves every secondary family while guarding the human-first order by one testable name.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { startEretzWorldActorHydration } from './EretzWorldActorHydration.js';

test('secondary actor hydration waits for friendly hydration to resolve', async () => {
	let resolveFriendly;
	let secondaryStarts = 0;
	const friendlyPromise = new Promise(resolve => {
		resolveFriendly = resolve;
	});
	const runtime = {};
	const worldPromise = startEretzWorldActorHydration(
		runtime,
		{
			startFriendlyActorHydration: () => friendlyPromise,
			startSecondaryActorHydration: () => {
				secondaryStarts += 1;
				return Promise.resolve({ status: 'ready' });
			}
		}
	);
	assert.equal(secondaryStarts, 0);
	assert.equal(runtime.friendlyActorHydrationPromise, friendlyPromise);
	runtime.friendlyNpcs = { actors: [{ id: 'one' }] };
	resolveFriendly(runtime.friendlyNpcs);
	await Promise.resolve();
	assert.equal(secondaryStarts, 1);
	const result = await worldPromise;
	assert.equal(result.friendly, 1);
	assert.equal(result.status, 'settled');
});

test('world actor coordinator is idempotent', async () => {
	let friendlyStarts = 0;
	let secondaryStarts = 0;
	const runtime = {};
	const options = {
		startFriendlyActorHydration: async () => {
			friendlyStarts += 1;
			runtime.friendlyNpcs = { actors: [] };
		},
		startSecondaryActorHydration: async () => {
			secondaryStarts += 1;
		}
	};
	const first = startEretzWorldActorHydration(runtime, options);
	const second = startEretzWorldActorHydration(runtime, options);
	assert.equal(first, second);
	await first;
	assert.equal(friendlyStarts, 1);
	assert.equal(secondaryStarts, 1);
});
