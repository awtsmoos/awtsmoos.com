//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file deferredWorldActorBoundary.test.mjs
 * @description Guards the staged actor-loading covenant: first play stays light,
 * friendly life arrives before secondary systems, and heavy families remain behind
 * a delayed dynamic-import boundary that cannot block the first controllable frame.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = relative => readFile(new URL(relative, import.meta.url), 'utf8');

test('first-playable actor system excludes heavy world families', async () => {
	const text = await source('../../app/EretzActorSystem.js');
	assert.doesNotMatch(text, /LavaLevel|SunShadowProjector|HorseHerdSystem/);
	assert.doesNotMatch(text, /FriendlyNpcPopulation|HostileNpcPopulation|DynamicDoor3D/);
	assert.match(text, /createDeferredActorSystems/);
	assert.match(text, /createEretzMover/);
});

test('world actor coordinator stages friendly life before secondary systems', async () => {
	const text = await source('../../app/EretzWorldActorHydration.js');
	assert.match(text, /startEretzFriendlyActorHydration/);
	assert.match(text, /startEretzSecondaryActorHydration/);
	assert.match(text, /friendlyPromise\.then/);
	assert.doesNotMatch(text, /EretzActorFactories/);
});

test('secondary hydration alone owns heavy imports and delayed revelation', async () => {
	const text = await source('../../app/EretzSecondaryActorHydration.js');
	assert.match(text, /import\('\.\/EretzActorFactories\.js/);
	assert.match(text, /secondaryActorStreamingDelayMs/);
	assert.match(text, /afterVisibleFrames/);
	assert.match(text, /LavaLevel|SunShadowProjector/);
});
